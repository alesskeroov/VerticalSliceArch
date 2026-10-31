using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Todos.GetTodos;

// Statik qabıq sorğu modelini, handler-i və endpoint-i eyni yerdə saxlayır.
public static class GetTodos
{
    public record Request(string? Filter);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task<IResult> Handle(Request request)
        {
            var filter = request.Filter ?? "all";
            if (filter != "all" && filter != "active" && filter != "completed")
                return Results.BadRequest("Filtr all, active və ya completed olmalıdır.");
            // Oxunan obyektləri izləməyə ehtiyac yoxdur; yalnız JSON qaytarırıq.
            var query = database.Todos.AsNoTracking();
            if (filter == "active") query = query.Where(todo => !todo.IsCompleted);
            if (filter == "completed") query = query.Where(todo => todo.IsCompleted);
            var todos = await query.OrderByDescending(todo => todo.CreatedAt).ToListAsync();
            return Results.Ok(todos);
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Filtr URL parametrindən alınır; GET üçün sorğu gövdəsi tələb edilmir.
        app.MapGet("/api/todos", (string? filter, Handler handler) =>
            handler.Handle(new Request(filter))).WithTags("Tapşırıqlar");
    }
}
