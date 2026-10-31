using TodoApi.Features.Auth.Register;
using TodoApi.Features.Auth.Login;
using TodoApi.Features.Auth.Me;
using Hangfire;
using Hangfire.InMemory;
using Microsoft.EntityFrameworkCore;
using TodoApi.Common;
using TodoApi.Composition;
using TodoApi.Features.Todos.CreateTodo;
using TodoApi.Features.Todos.DeleteTodo;
using TodoApi.Features.Todos.GetTodos;
using TodoApi.Features.Todos.ToggleTodo;
using TodoApi.Features.Todos.UpdateTodo;
using TodoApi.Features.Jobs.CleanupCompletedTodos;
using TodoApi.Features.Jobs.TodoCreatedNotification;

// Visual Studio fərqli iş qovluğu seçsə də, appsettings çıxış qovluğundan oxunsun.
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args, ContentRootPath = AppContext.BaseDirectory
});
if (builder.Environment.IsDevelopment())
{
    // Development sirri açıq yüklənir; mühit və əmr sətri ayarlarının üstünlüyü qorunur.
    builder.Configuration.AddUserSecrets<JwtSettings>(optional: true)
        .AddEnvironmentVariables().AddCommandLine(args);
}
// Windows Authentication istifadə olunur; kodda parol saxlanmır.
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("TodoDatabase")));
// Handler qeydiyyatları Composition qovluğunda açıq şəkildə saxlanır.
builder.Services.AddTodoFeatures();
builder.Services.AddTodoAuthentication(builder.Configuration);
builder.Services.AddHangfire(config => config.UseInMemoryStorage());
if (!builder.Environment.IsEnvironment("Testing")) builder.Services.AddHangfireServer();
// Origin ayardan gəlir; yalnız frontend ünvanına icazə verilir.
var frontendOrigin = builder.Configuration["FrontendOrigin"]
    ?? throw new InvalidOperationException("FrontendOrigin ayarı tapılmadı.");
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
// Feature-lərdə Request adı təkrarlandığı üçün Swagger tam tip adını istifadə edir.
builder.Services.AddSwaggerGen(options => options.CustomSchemaIds(
    type => (type.FullName ?? type.Name).Replace("+", ".")));
var app = builder.Build();
// Code First migration-ları ilk açılışda bazanı və cədvəlləri yaradır.
// Demo üçün avtomatikdir; real yayımlamada ayrıca yerləşdirmə addımı seçilə bilər.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await database.Database.MigrateAsync();
}
app.UseCors();
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    if (context.Request.Path.StartsWithSegments("/api/auth"))
        context.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseRateLimiter();
// Əvvəl kimlik yoxlanır, sonra həmin kimliyin giriş icazəsi qiymətləndirilir.
app.UseAuthentication();
app.UseAuthorization();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHangfireDashboard("/hangfire");
}
Register.MapEndpoint(app);
Login.MapEndpoint(app);
Me.MapEndpoint(app);
TodoApi.Features.Auth.ForgotPassword.ForgotPassword.MapEndpoint(app);
TodoApi.Features.Auth.ResetPassword.ResetPassword.MapEndpoint(app);
TodoApi.Features.Auth.Logout.Logout.MapEndpoint(app);
GetTodos.MapEndpoint(app);
CreateTodo.MapEndpoint(app);
UpdateTodo.MapEndpoint(app);
ToggleTodo.MapEndpoint(app);
DeleteTodo.MapEndpoint(app);
TodoCreatedNotification.MapEndpoint(app);
CleanupCompletedTodos.MapEndpoint(app);
// Eyni ID-li plan yenilənir; hər açılışda dublikat plan yaranmır.
if (!app.Environment.IsEnvironment("Testing")) app.Services.GetRequiredService<IRecurringJobManager>()
    .AddOrUpdate<CleanupCompletedTodos.Handler>("cleanup-completed-todos",
        handler => handler.Handle(), Cron.Hourly());
app.Run();

public partial class Program { }
