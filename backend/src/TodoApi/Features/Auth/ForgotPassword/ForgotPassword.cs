using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.ForgotPassword;

public static class ForgotPassword
{
    public record Request(string? Email);
    public const string Message = "Əgər bu email qeydiyyatdadırsa, şifrə sıfırlama linki göndəriləcək.";

    public class Handler(AppDbContext database, IPasswordResetEmail emailSender,
        PasswordResetSettings settings, ILogger<Handler> logger)
    {
        public async Task<IResult> Handle(Request request)
        {
            var email = request.Email?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email) || email.Length > 254 ||
                !MailAddress.TryCreate(email, out var address) || address.Address != email)
                return Results.Ok(new { message = Message });
            var user = await database.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Email == email);
            if (user is not null)
            {
                var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
                var hash = HashToken(token);
                var expires = DateTime.UtcNow.AddMinutes(settings.ExpiryMinutes);
                await database.Users.Where(u => u.Id == user.Id).ExecuteUpdateAsync(update => update
                    .SetProperty(u => u.ResetTokenHash, hash).SetProperty(u => u.ResetTokenExpiresAt, expires));
                // Fragment is never included in HTTP requests/referrers or server access logs.
                var resetUrl = $"{settings.FrontendUrl.TrimEnd('/')}/#reset-password?email={Uri.EscapeDataString(email)}&token={token}";
                try { await emailSender.SendAsync(email, resetUrl); }
                catch (Exception)
                {
                    // Do not log the address, reset link, token, SMTP credentials, or exception payload.
                    logger.LogError("Password reset email delivery failed; check SMTP configuration/service.");
                }
            }
            return Results.Ok(new { message = Message });
        }
    }

    public static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public static void MapEndpoint(WebApplication app) => app.MapPost("/api/auth/forgot-password",
        (Request request, Handler handler) => handler.Handle(request))
        .AllowAnonymous().RequireRateLimiting("password-reset").WithTags("Giriş");
}
