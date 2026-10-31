namespace TodoApi.Common;

// Code First: EF Core bu model əsasında cədvəl quruluşunu müəyyən edir.
public class Todo
{
    public Guid Id { get; set; }
    // Nullable yalnız köhnə sahibsiz qeydləri silmədən saxlamaq üçündür; API həmişə sahib təyin edir.
    public Guid? UserId { get; set; }
    public string Title { get; set; } = "";
    public bool IsCompleted { get; set; }
    // UTC fərqli saat qurşaqları arasında tarixləri müqayisə etməyi asanlaşdırır.
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
