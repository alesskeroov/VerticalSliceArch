using System.Net.Mail;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.Register;

public static class Register
{
    public record Request(string? Email, string? Password, string? DisplayName, string? ConfirmPassword);
    public class Handler
    {
        private readonly AppDbContext database;
        private readonly PasswordService passwords;
        public Handler(AppDbContext database, PasswordService passwords)
        {
            this.database = database; this.passwords = passwords;
        }
        public async Task<IResult> Handle(Request request)
        {
            var email = request.Email?.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(email) || email.Length > 254 ||
                !MailAddress.TryCreate(email, out var address) || address.Address != email)
                return Results.BadRequest("Düzgün email ünvanı daxil edin.");
            if (request.Password is null || request.Password.Length < 8 || request.Password.Length > 128)
                return Results.BadRequest("Parol 8–128 simvol olmalıdır.");
            if (request.Password != request.ConfirmPassword)
                return Results.BadRequest("Parollar uyğun gəlmir.");
            if (string.IsNullOrWhiteSpace(request.DisplayName) || request.DisplayName.Trim().Length > 100)
                return Results.BadRequest("Ad boş ola bilməz və 100 simvoldan uzun olmamalıdır.");
            if (await database.Users.AnyAsync(user => user.Email == email))
                return Results.Conflict("Bu email artıq qeydiyyatdan keçib.");
            var user = new User
            {
                Id = Guid.NewGuid(), Email = email, DisplayName = request.DisplayName.Trim(),
                PasswordHash = passwords.Hash(request.Password), CreatedAt = DateTime.UtcNow
            };
            database.Users.Add(user);
            try { await database.SaveChangesAsync(); }
            // İki paralel qeydiyyatın eyni email yaratmasını unikal indeks də qoruyur.
            catch (DbUpdateException error) when (error.InnerException is SqlException sql &&
                (sql.Number == 2601 || sql.Number == 2627))
            { return Results.Conflict("Bu email artıq qeydiyyatdan keçib."); }
            return Results.Created("/api/auth/me", new { user.Id, user.Email, user.DisplayName, user.CreatedAt });
        }
    }
    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/auth/register", (Request request, Handler handler) => handler.Handle(request))
            .AllowAnonymous().RequireRateLimiting("auth").WithTags("Giriş");
    }
}
