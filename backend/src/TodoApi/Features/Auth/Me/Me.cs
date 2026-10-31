using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.Me;

public static class Me
{
    public record Request(Guid UserId);
    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Request request)
        {
            // Yalnız açıq sahələri seçirik; entity və PasswordHash cavaba düşmür.
            var user = await database.Users.AsNoTracking().Where(user => user.Id == request.UserId)
                .Select(user => new { user.Id, user.Email, user.DisplayName, user.CreatedAt }).SingleOrDefaultAsync();
            return user is null ? Results.Unauthorized() : Results.Ok(user);
        }
    }
    public static void MapEndpoint(WebApplication app)
    {
        app.MapGet("/api/auth/me", (ClaimsPrincipal user, Handler handler) =>
            handler.Handle(new Request(user.GetUserId()))).RequireAuthorization().WithTags("Giriş");
    }
}
