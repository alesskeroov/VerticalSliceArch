using System.Text.Json.Serialization;

namespace TodoApi.Common;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    // Cavablarda yalnız açıq sahələr seçilir; bu atribut əlavə qoruma verir.
    [JsonIgnore]
    public string PasswordHash { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    [JsonIgnore]
    public int SessionVersion { get; set; }
    [JsonIgnore]
    public string? ResetTokenHash { get; set; }
    [JsonIgnore]
    public DateTime? ResetTokenExpiresAt { get; set; }
}
