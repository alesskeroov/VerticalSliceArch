using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.ResetPassword;

public static class ResetPassword
{
    public record Request(string? Email, string? Token, string? Password, string? ConfirmPassword);
    public class Handler(AppDbContext database, PasswordService passwords)
    {
        public async Task<IResult> Handle(Request request)
        {
            if (request.Password is null || request.Password.Length < 8 || request.Password.Length > 128)
                return Results.BadRequest("Parol 8–128 simvol olmalıdır.");
            if (request.Password != request.ConfirmPassword)
                return Results.BadRequest("Parollar uyğun gəlmir.");
            if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 ||
                request.Token is null || request.Token.Length != 64 || !request.Token.All(Uri.IsHexDigit))
                return InvalidToken();
            var email = request.Email.Trim().ToLowerInvariant();
            var hash = ForgotPassword.ForgotPassword.HashToken(request.Token);
            var now = DateTime.UtcNow;
            // Single conditional UPDATE consumes the token and changes the password atomically.
            // Concurrent submissions cannot both succeed, including across application instances.
            var passwordHash = passwords.Hash(request.Password);
            var count = await database.Users.Where(user => user.Email == email &&
                user.ResetTokenHash == hash && user.ResetTokenExpiresAt > now)
                .ExecuteUpdateAsync(update => update.SetProperty(user => user.PasswordHash, passwordHash)
                    .SetProperty(user => user.ResetTokenHash, (string?)null)
                    .SetProperty(user => user.ResetTokenExpiresAt, (DateTime?)null)
                    .SetProperty(user => user.SessionVersion, user => user.SessionVersion + 1));
            return count == 1 ? Results.Ok(new { message = "Şifrəniz yeniləndi. Yeni şifrə ilə daxil olun." }) : InvalidToken();
        }
        private static IResult InvalidToken() => Results.BadRequest("Link etibarsızdır və ya vaxtı bitib. Yeni link istəyin.");
    }
    public static void MapEndpoint(WebApplication app) => app.MapPost("/api/auth/reset-password",
        (Request request, Handler handler) => handler.Handle(request))
        .AllowAnonymous().RequireRateLimiting("password-reset").WithTags("Giriş");
}
