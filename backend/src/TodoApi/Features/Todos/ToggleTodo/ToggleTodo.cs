using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApi.Common;

namespace TodoApi.Features.Todos.ToggleTodo;

public static class ToggleTodo
{
    // ID URL-dən gəlir; gövdə tələb etməyən sorğunu da eyni şablonda saxlayırıq.
    public record Request(Guid Id);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Guid userId, Request request)
        {
            var todo = await database.Todos.SingleOrDefaultAsync(todo => todo.Id == request.Id && todo.UserId == userId);
            if (todo is null) return Results.NotFound("Tapşırıq tapılmadı.");
            todo.IsCompleted = !todo.IsCompleted;
            // Geri aktiv ediləndə köhnə tarix silinir ki, cleanup onu silməsin.
            todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;
            await database.SaveChangesAsync();
            return Results.Ok(todo);
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        app.MapPatch("/api/todos/{id:guid}/toggle", (Guid id, ClaimsPrincipal user, Handler handler) =>
            handler.Handle(user.GetUserId(), new Request(id))).RequireAuthorization().WithTags("Tapşırıqlar");
    }
}
