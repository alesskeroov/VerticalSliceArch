using Microsoft.EntityFrameworkCore;
using TodoApi.Common;

namespace TodoApi.Features.Jobs.CleanupCompletedTodos;

public static class CleanupCompletedTodos
{
    // Plan parametr tələb etmir; record yalnız ortaq feature şablonunu qoruyur.
    public record Request;

    public class Handler
    {
        private readonly AppDbContext database;
        public Handler(AppDbContext database) { this.database = database; }

        public async Task Handle()
        {
            var cutoff = DateTime.UtcNow.AddDays(-7);
            // Sistem job-u bütün istifadəçilər üçün işləyir; HTTP istifadəçi filtri burada yoxdur.
            // Tamamlanma tarixinə baxırıq, yaradılma tarixinə deyil.
            var deletedCount = await database.Todos
                .Where(todo => todo.IsCompleted && todo.CompletedAt < cutoff)
                .ExecuteDeleteAsync();
            Console.WriteLine($"Təmizləmə: {deletedCount} tamamlanmış tapşırıq silindi.");
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // HTTP ünvanı yoxdur; saatlıq plan Program.cs-də qeyd olunur.
    }
}
