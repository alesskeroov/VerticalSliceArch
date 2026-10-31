using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TodoApi.Common;
using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace TodoApi.Tests;

public sealed class AuthApplication : WebApplicationFactory<Program>
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    public RecordingEmail Email { get; } = new();
    public AuthApplication()
    {
        connection.Open();
        // Program reads configuration before Build: environment settings are available then.
        Environment.SetEnvironmentVariable("Jwt__Secret", "integration-test-secret-only-64-characters-long-no-production-use");
        Environment.SetEnvironmentVariable("Jwt__Issuer", "MatchdayTests");
        Environment.SetEnvironmentVariable("Jwt__Audience", "MatchdayTests");
        Environment.SetEnvironmentVariable("Jwt__ExpiryMinutes", "60");
        Environment.SetEnvironmentVariable("PasswordReset__FrontendUrl", "https://matchday.example");
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseSqlite(connection));
            services.RemoveAll<IPasswordResetEmail>();
            services.AddSingleton<IPasswordResetEmail>(Email);
        });
    }
    public HttpClient Start()
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        using var scope = Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
        return client;
    }
    public async Task InDatabase(Func<AppDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) connection.Dispose();
    }
}

public sealed class RecordingEmail : IPasswordResetEmail
{
    public System.Collections.Concurrent.ConcurrentQueue<(string Email, string Url)> Sent { get; } = new();
    public bool Fail { get; set; }
    public Task SendAsync(string email, string resetUrl)
    {
        if (Fail) throw new InvalidOperationException("Simulated delivery outage");
        Sent.Enqueue((email, resetUrl));
        return Task.CompletedTask;
    }
    public async Task<string> WaitToken()
    {
        for (var i = 0; i < 100 && Sent.IsEmpty; i++) await Task.Delay(20);
        Assert.False(Sent.IsEmpty);
        return Sent.Last().Url.Split("&token=")[1];
    }
}

public sealed class AuthenticationTests
{
    private const string Password = "Matchday-password-123";
    private const string NewPassword = "Changed-password-456";
    private static async Task<JsonElement> Json(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.Clone();
    private static Task<HttpResponseMessage> Register(HttpClient client, string email = "one@example.com") =>
        client.PostAsJsonAsync("/api/auth/register", new { email, displayName = "Player", password = Password, confirmPassword = Password });
    private static async Task<string> Login(HttpClient client, string email = "one@example.com", string password = Password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return (await Json(response)).GetProperty("token").GetString()!;
    }
    private static void Authenticate(HttpClient client, string token) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    private static Task<HttpResponseMessage> Reset(HttpClient client, string token, string password = NewPassword) =>
        client.PostAsJsonAsync("/api/auth/reset-password", new { email = "one@example.com", token, password, confirmPassword = password });

    [Fact]
    public async Task Registration_validates_confirmation_unique_email_and_hides_password_hash()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        var mismatch = await client.PostAsJsonAsync("/api/auth/register", new { email = "one@example.com", displayName = "Player", password = Password, confirmPassword = "different" });
        Assert.Equal(HttpStatusCode.BadRequest, mismatch.StatusCode);
        var registered = await Register(client);
        Assert.Equal(HttpStatusCode.Created, registered.StatusCode);
        Assert.DoesNotContain("password", (await registered.Content.ReadAsStringAsync()).ToLowerInvariant());
        Assert.Equal(HttpStatusCode.Conflict, (await Register(client, " ONE@example.com ")).StatusCode);
        await app.InDatabase(async db =>
        {
            var user = await db.Users.SingleAsync();
            Assert.NotEqual(Password, user.PasswordHash);
            Assert.True(new PasswordService().Verify(Password, user.PasswordHash));
        });
    }

    [Fact]
    public async Task Login_me_logout_and_invalid_credentials_are_secure()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        await Register(client);
        var wrong = await client.PostAsJsonAsync("/api/auth/login", new { email = "one@example.com", password = "Wrong-password" });
        var absent = await client.PostAsJsonAsync("/api/auth/login", new { email = "absent@example.com", password = "Wrong-password" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal(await wrong.Content.ReadAsStringAsync(), await absent.Content.ReadAsStringAsync());
        var token = await Login(client); Authenticate(client, token);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsync("/api/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/todos")).StatusCode);
    }

    [Fact]
    public async Task Password_reset_is_hashed_one_time_and_revokes_existing_sessions()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        await Register(client); var session = await Login(client);
        var requested = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "one@example.com" });
        Assert.Equal(HttpStatusCode.OK, requested.StatusCode);
        var token = await app.Email.WaitToken();
        Assert.Equal(64, token.Length);
        await app.InDatabase(async db =>
        {
            var user = await db.Users.SingleAsync();
            Assert.NotEqual(token, user.ResetTokenHash);
            Assert.Equal(64, user.ResetTokenHash!.Length);
            Assert.True(user.ResetTokenExpiresAt > DateTime.UtcNow);
        });
        Assert.Equal(HttpStatusCode.OK, (await Reset(client, token)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Reset(client, token)).StatusCode);
        Authenticate(client, session);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/login", new { email = "one@example.com", password = Password })).StatusCode);
        Authenticate(client, await Login(client, password: NewPassword));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Expired_tokens_are_rejected_and_repeated_requests_are_cooled_down()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        await Register(client);
        await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "one@example.com" });
        var first = await app.Email.WaitToken();
        await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "one@example.com" });
        var current = await app.Email.WaitToken();
        Assert.Equal(first, current); Assert.Single(app.Email.Sent);
        // The still-valid first token remains valid during the address cooldown.
        await app.InDatabase(async db =>
        {
            var user = await db.Users.SingleAsync(); user.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(-1); await db.SaveChangesAsync();
        });
        Assert.Equal(HttpStatusCode.BadRequest, (await Reset(client, current)).StatusCode);
    }

    [Fact]
    public async Task Forgot_password_does_not_enumerate_accounts_even_during_email_outage()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        await Register(client); app.Email.Fail = true;
        var existing = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "one@example.com" });
        var absent = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "absent@example.com" });
        Assert.Equal(HttpStatusCode.OK, existing.StatusCode);
        Assert.Equal(existing.StatusCode, absent.StatusCode);
        Assert.Equal(await existing.Content.ReadAsStringAsync(), await absent.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Password_reset_and_login_are_rate_limited()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        for (var i = 0; i < 5; i++) Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "absent@example.com" })).StatusCode);
        var limited = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "absent@example.com" });
        Assert.Equal(HttpStatusCode.TooManyRequests, limited.StatusCode);
        Assert.True(limited.Headers.Contains("Retry-After"));
        for (var i = 0; i < 10; i++) Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/auth/login", new { email = "absent@example.com", password = Password })).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/auth/login", new { email = "absent@example.com", password = Password })).StatusCode);
    }

    [Fact]
    public async Task Every_todo_operation_is_scoped_to_owner_and_legacy_data_is_preserved()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        foreach (var method in new[] { HttpMethod.Get, HttpMethod.Post })
        {
            using var request = new HttpRequestMessage(method, "/api/todos");
            if (method == HttpMethod.Post) request.Content = JsonContent.Create(new { title = "Unauthorized" });
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(request)).StatusCode);
        }
        await Register(client); await Register(client, "two@example.com");
        var one = await Login(client); var two = await Login(client, "two@example.com");
        var legacyId = Guid.NewGuid();
        await app.InDatabase(async db => { db.Todos.Add(new Todo { Id = legacyId, Title = "Legacy", CreatedAt = DateTime.UtcNow }); await db.SaveChangesAsync(); });
        Authenticate(client, one);
        var created = await client.PostAsJsonAsync("/api/todos", new { title = "Private task" });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await Json(created)).GetProperty("id").GetGuid();
        Assert.Single((await Json(await client.GetAsync("/api/todos"))).EnumerateArray());
        Authenticate(client, two);
        Assert.Empty((await Json(await client.GetAsync("/api/todos"))).EnumerateArray());
        foreach (var target in new[] { id, legacyId })
        {
            Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync($"/api/todos/{target}", new { title = "Hacked" })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.PatchAsync($"/api/todos/{target}/toggle", null)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/todos/{target}")).StatusCode);
        }
        Authenticate(client, one);
        Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync($"/api/todos/{id}", new { title = "Updated" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PatchAsync($"/api/todos/{id}/toggle", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/todos/{id}")).StatusCode);
        await app.InDatabase(async db => Assert.Equal("Legacy", (await db.Todos.SingleAsync()).Title));
    }
    [Fact]
    public async Task Reset_rejects_wrong_email_and_password_mismatch_and_only_one_concurrent_use_succeeds()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        await Register(client);
        await client.PostAsJsonAsync("/api/auth/forgot-password", new { email = "one@example.com" });
        var token = await app.Email.WaitToken();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/auth/reset-password", new { email = "other@example.com", token, password = NewPassword, confirmPassword = NewPassword })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/auth/reset-password", new { email = "one@example.com", token, password = NewPassword, confirmPassword = "different" })).StatusCode);
        var responses = await Task.WhenAll(Reset(client, token), Reset(client, token));
        Assert.Single(responses, response => response.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, response => response.StatusCode == HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Malformed_or_tampered_bearer_tokens_cannot_access_protected_endpoints()
    {
        using var app = new AuthApplication(); using var client = app.Start();
        await Register(client);
        var valid = await Login(client);
        foreach (var invalid in new[] { "not-a-jwt", valid[..^8] + "abcdefgh" })
        {
            Authenticate(client, invalid);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/todos")).StatusCode);
        }
    }
}




