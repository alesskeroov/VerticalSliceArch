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
}
