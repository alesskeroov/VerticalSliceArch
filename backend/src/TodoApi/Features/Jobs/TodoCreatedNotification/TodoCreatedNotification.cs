using TodoApi.Common;

namespace TodoApi.Features.Jobs.TodoCreatedNotification;

public static class TodoCreatedNotification
{
    // Request şablonu saxlanır; Hangfire metoduna isə yalnız sadə ID ötürülür.
    public record Request(Guid TodoId);

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task Handle(Guid todoId)
        {
            var request = new Request(todoId);
            var todo = await database.Todos.FindAsync(request.TodoId);
            // İcra başlamazdan əvvəl tapşırıq silinə bilər; bu, normal haldır.
            if (todo is null) return;
            Console.WriteLine($"Yeni tapşırıq yaradıldı: {todo.Title}");
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Şablon eynidir, amma job HTTP endpoint-i açmır; Hangfire onu çağırır.
    }
}
