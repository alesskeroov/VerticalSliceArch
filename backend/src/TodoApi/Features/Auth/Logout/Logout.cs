using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Auth.Logout;

public static class Logout
{
    public static void MapEndpoint(WebApplication app) => app.MapPost("/api/auth/logout",
        async (ClaimsPrincipal principal, AppDbContext database) =>
        {
            var id = principal.GetUserId();
            await database.Users.Where(user => user.Id == id).ExecuteUpdateAsync(update =>
                update.SetProperty(user => user.SessionVersion, user => user.SessionVersion + 1));
            return Results.Ok(new { message = "Bütün sessiyalardan çıxış edildi." });
        }).RequireAuthorization().WithTags("Giriş");
}
