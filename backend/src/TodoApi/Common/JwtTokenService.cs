using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TodoApi.Common;

public class JwtTokenService
{
    private readonly JwtSettings settings;
    public JwtTokenService(JwtSettings settings) { this.settings = settings; }

    public object Create(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(settings.ExpiryMinutes);
        // Claim istifadəçi haqqında imzalanmış məlumatdır; parol və hash tokenə yazılmır.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.DisplayName)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret));
        var token = new JwtSecurityToken(settings.Issuer, settings.Audience, claims,
            expires: expiresAt, signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token), expiresAt,
            user = new { user.Id, user.Email, user.DisplayName, user.CreatedAt }
        };
    }
}
