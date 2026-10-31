using Hangfire;
using Hangfire.InMemory;
using VerticalSliceArch.Common;
using VerticalSliceArch.Features.Orders.CreateOrder;
using VerticalSliceArch.Features.Orders.GetOrders;
using VerticalSliceArch.Features.Reports.DailyReport;
using VerticalSliceArch.Features.Reports.SendOrderConfirmation;

var builder = WebApplication.CreateBuilder(args);
// Singleton: API və job-lar eyni yaddaşdakı bazadan istifadə edir.
builder.Services.AddSingleton<FakeDatabase>();
// DI hər handler-i lazım olduqda yaradır və asılılıqlarını verir.
builder.Services.AddTransient<CreateOrder.Handler>();
builder.Services.AddTransient<GetOrders.Handler>();
builder.Services.AddTransient<DailyReport.Handler>();
builder.Services.AddTransient<SendOrderConfirmation.Handler>();
// Job məlumatları yaddaşda saxlanır; ayrıca baza qurmuruq.
builder.Services.AddHangfire(configuration => configuration.UseInMemoryStorage());
// Server növbədəki işləri arxa planda icra edir.
builder.Services.AddHangfireServer();
var app = builder.Build();
// Dashboard job-ların vəziyyətini izləmək üçündür.
app.UseHangfireDashboard("/hangfire");
CreateOrder.MapEndpoint(app);
GetOrders.MapEndpoint(app);
DailyReport.MapEndpoint(app);
SendOrderConfirmation.MapEndpoint(app);
// AddOrUpdate eyni adlı planı yaradır və ya yeniləyir; dublikat yaratmır.
var recurringJobs = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobs.AddOrUpdate<DailyReport.Handler>(
    "daily-report", handler => handler.Handle(), Cron.Minutely());
app.Run();
