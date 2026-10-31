using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
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
        services.AddScoped<TodoApi.Features.Auth.ForgotPassword.ForgotPassword.Handler>();
        services.AddScoped<TodoApi.Features.Auth.ResetPassword.ResetPassword.Handler>();
        var resetSettings = config.GetSection("PasswordReset").Get<PasswordResetSettings>() ?? new();
        if (!Uri.TryCreate(resetSettings.FrontendUrl, UriKind.Absolute, out var resetUri) ||
            (resetUri.Scheme != "https" && !(resetUri.Scheme == "http" && resetUri.IsLoopback)) ||
            !string.IsNullOrEmpty(resetUri.Fragment) || !string.IsNullOrEmpty(resetUri.Query) ||
            resetSettings.ExpiryMinutes is < 5 or > 60)
            throw new InvalidOperationException("PasswordReset: HTTPS frontend URL (local HTTP allowed), expiry 5–60 minutes required.");
        services.AddSingleton(resetSettings);
        services.AddSingleton(config.GetSection("Smtp").Get<SmtpSettings>() ?? new());
        services.AddScoped<IPasswordResetEmail, SmtpPasswordResetEmail>();
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellation) =>
            {
                context.HttpContext.Response.Headers.RetryAfter = "900";
                await context.HttpContext.Response.WriteAsJsonAsync("Çox sayda cəhd edildi. Bir qədər sonra yenidən cəhd edin.", cancellation);
            };
            foreach (var (name, limit) in new[] { ("auth", 10), ("password-reset", 5) })
                options.AddPolicy(name, context => RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = limit, Window = TimeSpan.FromMinutes(15),
                        QueueLimit = 0, AutoReplenishment = true
                    }));
        });
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
                OnTokenValidated = async context =>
                {
                    if (!Guid.TryParse(context.Principal?.FindFirstValue("sub"), out var id) ||
                        !int.TryParse(context.Principal?.FindFirstValue("session_version"), out var version))
                    {
                        context.Fail("İstifadəçi ID-si düzgün deyil.");
                        return;
                    }
                    var database = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                    if (!await database.Users.AsNoTracking().AnyAsync(user => user.Id == id && user.SessionVersion == version))
                        context.Fail("Sessiya etibarsızdır.");
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
