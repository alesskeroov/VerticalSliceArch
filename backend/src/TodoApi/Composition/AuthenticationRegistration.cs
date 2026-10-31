using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TodoApi.Common;
using TodoApi.Features.Auth.Login;
using TodoApi.Features.Auth.Me;
using TodoApi.Features.Auth.Register;

namespace TodoApi.Composition;

public static class AuthenticationRegistration
{
    public static IServiceCollection AddTodoAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var settings = config.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        // Hər ayarı ayrıca yoxlayırıq ki, xəta mesajı səbəbi dəqiq göstərsin.
        if (string.IsNullOrWhiteSpace(settings.Secret) || settings.Secret.Length < 32)
            throw new InvalidOperationException("Jwt:Secret oxunmadı və ya 32 simvoldan qısadır. README-dəki user-secrets əmrini işlədin və http Development profilini seçin.");
        if (string.IsNullOrWhiteSpace(settings.Issuer) || string.IsNullOrWhiteSpace(settings.Audience))
            throw new InvalidOperationException("Jwt:Issuer və Jwt:Audience oxunmadı. appsettings.json faylını yoxlayın.");
        if (settings.ExpiryMinutes != 60)
            throw new InvalidOperationException("Jwt:ExpiryMinutes 60 olmalıdır.");
        services.AddSingleton(settings);
        services.AddSingleton<PasswordService>();
        services.AddSingleton<JwtTokenService>();
        services.AddScoped<Register.Handler>();
        services.AddScoped<Login.Handler>();
        services.AddScoped<Me.Handler>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            // sub və name adlarını dəyişmədən saxlayırıq ki, tokenin quruluşu aydın qalsın.
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = settings.Issuer,
                ValidateAudience = true, ValidAudience = settings.Audience,
                ValidateLifetime = true, ClockSkew = TimeSpan.Zero,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret)),
                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }, NameClaimType = "name"
            };
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    if (!Guid.TryParse(context.Principal?.FindFirstValue("sub"), out _))
                        context.Fail("İstifadəçi ID-si düzgün deyil.");
                    return Task.CompletedTask;
                }
            };
        });
        services.AddAuthorization();
        // Swagger-də tokeni Bearer prefiksi yazmadan daxil etmək kifayətdir.
        services.Configure<SwaggerGenOptions>(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme { Reference = new OpenApiReference
                    { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }] = Array.Empty<string>()
            });
        });
        return services;
    }
}
