using Microsoft.EntityFrameworkCore;

namespace TodoApi.Common;

// Scoped context hər sorğu və job üçün ayrıca baza sessiyası yaradır.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // HTTP yoxlamasına əlavə olaraq bazada da uzunluq həddi saxlanır.
        modelBuilder.Entity<Todo>().Property(todo => todo.Title)
            .HasMaxLength(200).IsRequired();
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<User>().Property(user => user.Email).HasMaxLength(254).IsRequired();
        modelBuilder.Entity<User>().Property(user => user.DisplayName).HasMaxLength(100).IsRequired();
        modelBuilder.Entity<User>().Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
        modelBuilder.Entity<Todo>().HasOne<User>().WithMany().HasForeignKey(todo => todo.UserId);
    }
}
