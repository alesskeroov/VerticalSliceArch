using System.Net;
using System.Net.Mail;

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
        await client.SendMailAsync(message);
    }
}
