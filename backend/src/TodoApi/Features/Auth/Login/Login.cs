using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.Login;

public static class Login
{
    public record Request(string? Email, string? Password);
    public class Handler
    {
        private readonly AppDbContext database;
        private readonly PasswordService passwords;
        private readonly JwtTokenService tokens;
        public Handler(AppDbContext database, PasswordService passwords, JwtTokenService tokens)
        { this.database = database; this.passwords = passwords; this.tokens = tokens; }

        public async Task<IResult> Handle(Request request)
        {
            var email = request.Email?.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(email) || email.Length > 254 ||
                !MailAddress.TryCreate(email, out var address) || address.Address != email)
                return Results.BadRequest("Düzgün email ünvanı daxil edin.");
            if (request.Password is null || request.Password.Length < 8)
                return Results.BadRequest("Parol ən azı 8 simvol olmalıdır.");
            var user = await database.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Email == email);
            // Hansı sahənin səhv olduğunu açıqlamırıq; hash heç bir cavabda yoxdur.
            if (user is null || !passwords.Verify(request.Password, user.PasswordHash))
                return Results.Json("Email və ya parol yanlışdır.", statusCode: 401);
            return Results.Ok(tokens.Create(user));
        }
    }
    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/auth/login", (Request request, Handler handler) => handler.Handle(request))
            .AllowAnonymous().WithTags("Giriş");
    }
}
