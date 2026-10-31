using TodoApi.Common;

namespace TodoApi.Features.Todos.DeleteTodo;

public static class DeleteTodo
{
    public record Request(Guid Id);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Request request)
        {
            var todo = await database.Todos.FindAsync(request.Id);
            if (todo is null) return Results.NotFound("Tapşırıq tapılmadı.");
            database.Todos.Remove(todo);
            await database.SaveChangesAsync();
            // Silinmiş obyektin gövdəsini qaytarmağa ehtiyac yoxdur.
            return Results.NoContent();
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        app.MapDelete("/api/todos/{id:guid}", (Guid id, Handler handler) =>
            handler.Handle(new Request(id))).WithTags("Tapşırıqlar");
    }
}
