using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApi.Common;

namespace TodoApi.Features.Todos.DeleteTodo;

public static class DeleteTodo
{
    public record Request(Guid Id);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Guid userId, Request request)
        {
            var todo = await database.Todos.SingleOrDefaultAsync(todo => todo.Id == request.Id && todo.UserId == userId);
            if (todo is null) return Results.NotFound("Tapşırıq tapılmadı.");
            database.Todos.Remove(todo);
            await database.SaveChangesAsync();
            // Silinmiş obyektin gövdəsini qaytarmağa ehtiyac yoxdur.
            return Results.NoContent();
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        app.MapDelete("/api/todos/{id:guid}", (Guid id, ClaimsPrincipal user, Handler handler) =>
            handler.Handle(user.GetUserId(), new Request(id))).RequireAuthorization().WithTags("Tapşırıqlar");
    }
}
