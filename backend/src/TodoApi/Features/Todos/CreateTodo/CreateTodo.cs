using System.Security.Claims;
using Hangfire;
using TodoApi.Common;
using TodoApi.Features.Jobs.TodoCreatedNotification;

namespace TodoApi.Features.Todos.CreateTodo;

public static class CreateTodo
{
    public record Request(string? Title);

    public class Handler
    {
        private readonly AppDbContext database;
        private readonly IBackgroundJobClient backgroundJobs;
        public Handler(AppDbContext database, IBackgroundJobClient backgroundJobs)
        {
            this.database = database;
            this.backgroundJobs = backgroundJobs;
        }

        public async Task<IResult> Handle(Guid userId, Request request)
        {
            // Kitabxanasız yoxlama kiçik demoda qaydanı görməyi asanlaşdırır.
            if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
                return Results.BadRequest("Başlıq boş ola bilməz və 200 simvoldan uzun olmamalıdır.");
            var todo = new Todo
            {
                Id = Guid.NewGuid(), UserId = userId, Title = request.Title.Trim(), CreatedAt = DateTime.UtcNow
            };
            database.Todos.Add(todo);
            // Əvvəl bazaya yazırıq ki, job ID ilə mövcud tapşırığı tapa bilsin.
            await database.SaveChangesAsync();
            // Enqueue cavabı gözlətmir. Hangfire parametr saxladığı üçün yalnız sadə ID ötürürük.
            backgroundJobs.Enqueue<TodoCreatedNotification.Handler>(job => job.Handle(todo.Id));
            // Tək obyekt üçün GET endpoint-i yoxdur; Location siyahını göstərir.
            return Results.Created("/api/todos", todo);
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/todos", (Request request, ClaimsPrincipal user, Handler handler) =>
            handler.Handle(user.GetUserId(), request)).RequireAuthorization().WithTags("Tapşırıqlar");
    }
}
