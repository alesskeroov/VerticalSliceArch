using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApi.Common;

namespace TodoApi.Features.Todos.UpdateTodo;

public static class UpdateTodo
{
    public record Request(string? Title);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Guid userId, Guid id, Request request)
        {
            var todo = await database.Todos.SingleOrDefaultAsync(todo => todo.Id == id && todo.UserId == userId);
            if (todo is null) return Results.NotFound("Tapşırıq tapılmadı.");
            // POST ilə eyni qayda saxlanır; əlavə validator kitabxanası yoxdur.
            if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
                return Results.BadRequest("Başlıq boş ola bilməz və 200 simvoldan uzun olmamalıdır.");
            todo.Title = request.Title.Trim();
            await database.SaveChangesAsync();
            return Results.Ok(todo);
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Başlıq dəyişir; tamamlanma vəziyyəti ayrı feature-in məsuliyyətidir.
        app.MapPut("/api/todos/{id:guid}", (Guid id, Request request, ClaimsPrincipal user, Handler handler) =>
            handler.Handle(user.GetUserId(), id, request)).RequireAuthorization().WithTags("Tapşırıqlar");
    }
}
