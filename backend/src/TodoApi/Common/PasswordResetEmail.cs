using System.Net;
using System.Net.Mail;
using System.Threading.Channels;
using Microsoft.Extensions.Caching.Memory;

namespace TodoApi.Common;

public class PasswordResetSettings
{
    public string FrontendUrl { get; set; } = "http://localhost:5173";
    public int ExpiryMinutes { get; set; } = 30;
}

public class SmtpSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string From { get; set; } = "";
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}

public interface IPasswordResetEmail
{
    Task SendAsync(string email, string resetUrl);
}

public sealed class SmtpPasswordResetEmail(SmtpSettings settings) : IPasswordResetEmail
{
    public async Task SendAsync(string email, string resetUrl)
    {
        if (string.IsNullOrWhiteSpace(settings.Host) || string.IsNullOrWhiteSpace(settings.From))
            throw new InvalidOperationException("SMTP Host və From ayarları tələb olunur.");
        using var client = new SmtpClient(settings.Host, settings.Port)
        {
            EnableSsl = settings.EnableSsl,
            UseDefaultCredentials = false
        };
        if (!string.IsNullOrWhiteSpace(settings.Username))
            client.Credentials = new NetworkCredential(settings.Username, settings.Password);
        using var message = new MailMessage(settings.From, email)
        {
            Subject = "Matchday — şifrənin sıfırlanması",
            Body = $"Yeni şifrə təyin etmək üçün linki açın:\n{resetUrl}\n\nBu sorğunu siz göndərməmisinizsə, məktubu nəzərə almayın.",
            IsBodyHtml = false
        };
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
        await client.SendMailAsync(message, timeout.Token);
    }
}

// Bounded, volatile queue keeps SMTP latency out of the public request and never persists tokens.
public sealed class PasswordResetDeliveryQueue : BackgroundService
{
    private readonly Channel<(string Email, string Url)> queue = Channel.CreateBounded<(string, string)>(100);
    private readonly IServiceScopeFactory scopes;
    private readonly ILogger<PasswordResetDeliveryQueue> logger;
    private readonly MemoryCache cooldowns = new(new MemoryCacheOptions { SizeLimit = 10000 });
    private readonly object gate = new();

    public PasswordResetDeliveryQueue(IServiceScopeFactory scopes, ILogger<PasswordResetDeliveryQueue> logger)
    { this.scopes = scopes; this.logger = logger; }

    public bool CanRequest(string normalizedEmail)
    {
        // Hash keys so addresses are not retained in limiter metadata. Unknown accounts use the same path.
        var key = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(normalizedEmail)));
        lock (gate)
        {
            if (cooldowns.TryGetValue(key, out _)) return false;
            cooldowns.Set(key, true, new MemoryCacheEntryOptions().SetSize(1).SetAbsoluteExpiration(TimeSpan.FromMinutes(5)));
            return true;
        }
    }

    public bool TryEnqueue(string email, string resetUrl) => queue.Writer.TryWrite((email, resetUrl));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var item in queue.Reader.ReadAllAsync(stoppingToken))
        {
            using var scope = scopes.CreateScope();
            try
            {
                await scope.ServiceProvider.GetRequiredService<IPasswordResetEmail>()
                    .SendAsync(item.Email, item.Url).WaitAsync(TimeSpan.FromSeconds(15), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception)
            {
                logger.LogError("Password reset email delivery failed; check SMTP configuration/service.");
            }
        }
    }

    public override void Dispose() { cooldowns.Dispose(); base.Dispose(); }
}
