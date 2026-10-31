using Microsoft.EntityFrameworkCore;

namespace TodoApi.Common;

// Scoped context hər sorğu və job üçün ayrıca baza sessiyası yaradır.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Todo> Todos => Set<Todo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // HTTP yoxlamasına əlavə olaraq bazada da uzunluq həddi saxlanır.
        modelBuilder.Entity<Todo>().Property(todo => todo.Title)
            .HasMaxLength(200).IsRequired();
    }
}
