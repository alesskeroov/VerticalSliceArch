using Hangfire;
using VerticalSliceArch.Common;
using VerticalSliceArch.Features.Reports.SendOrderConfirmation;

namespace VerticalSliceArch.Features.Orders.CreateOrder;

// Statik qabıq feature-in hissələrini bir yerdə saxlayır; özü yaradılmır.
public static class CreateOrder
{
    // Request yalnız müştərinin göndərdiyi məlumatları daşıyır.
    public record Request(string Email, string ProductName);

    public class Handler
    {
        private readonly FakeDatabase database;
        private readonly IBackgroundJobClient backgroundJobs;

        // DI ortaq bazanı və Hangfire müştərisini verir.
        public Handler(FakeDatabase database, IBackgroundJobClient backgroundJobs)
        {
            this.database = database;
            this.backgroundJobs = backgroundJobs;
        }

        public IResult Handle(Request request)
        {
            // Boş məlumatı saxlamamaq üçün sadə yoxlama edirik.
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.ProductName))
                return Results.BadRequest("Email və məhsul adı boş ola bilməz.");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                Email = request.Email.Trim(),
                ProductName = request.ProductName.Trim()
            };
            database.Add(order);
            // Enqueue işi növbəyə qoyur; HTTP cavabı emaili gözləmir.
            // Hangfire parametrləri saxlayır: bütöv obyekt əvəzinə sadə ID ötürürük.
            backgroundJobs.Enqueue<SendOrderConfirmation.Handler>(
                handler => handler.Handle(order.Id));
            return Results.Created("/orders", order);
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Endpoint məlumatı alır, məntiqi isə Handler yerinə yetirir.
        app.MapPost("/orders", (Request request, Handler handler) => handler.Handle(request));
    }
}
