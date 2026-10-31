using TodoApi.Features.Jobs.CleanupCompletedTodos;
using TodoApi.Features.Jobs.TodoCreatedNotification;
using TodoApi.Features.Todos.CreateTodo;
using TodoApi.Features.Todos.DeleteTodo;
using TodoApi.Features.Todos.GetTodos;
using TodoApi.Features.Todos.ToggleTodo;
using TodoApi.Features.Todos.UpdateTodo;

namespace TodoApi.Composition;

// Biznes məntiqi deyil: yalnız feature-lərin asılılıqlarını tətbiqə qoşur.
public static class ServiceRegistration
{
    // Extension method Program.cs-i yığcam saxlayır, qeydiyyatlar isə açıq görünür.
    public static IServiceCollection AddTodoFeatures(this IServiceCollection services)
    {
        // Scoped ömrü qorunur: ayrı sorğu və job-lar handler paylaşmır.
        services.AddScoped<GetTodos.Handler>();
        services.AddScoped<CreateTodo.Handler>();
        services.AddScoped<UpdateTodo.Handler>();
        services.AddScoped<ToggleTodo.Handler>();
        services.AddScoped<DeleteTodo.Handler>();
        services.AddScoped<TodoCreatedNotification.Handler>();
        services.AddScoped<CleanupCompletedTodos.Handler>();

        return services;
    }
}
