namespace TodoApi.Common;

// Secret yalnız user-secrets və ya mühit dəyişənindən gəlməlidir.
public class JwtSettings
{
    public string Secret { get; set; } = "";
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public int ExpiryMinutes { get; set; } = 60;
}
