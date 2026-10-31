using VerticalSliceArch.Common;

namespace VerticalSliceArch.Features.Reports.SendOrderConfirmation;

// Statik qabıq job-un bütün məntiqini bir feature-də saxlayır.
public static class SendOrderConfirmation
{
    // HTTP sorğusu yoxdur; Request əvəzinə sadə orderId parametri var.
    public class Handler
    {
        private readonly FakeDatabase database;

        public Handler(FakeDatabase database)
        {
            this.database = database;
        }

        public async Task Handle(Guid orderId)
        {
            // ID ilə ən son məlumatı oxuyuruq; bütöv obyekti job-da saxlamırıq.
            var order = database.Find(orderId);
            if (order is null)
                return;
            // Saxta email gecikməsi; Task.Delay gözləyərkən axını bloklamır.
            await Task.Delay(2000);
            Console.WriteLine($"Email göndərildi: {order.Email}, sifariş: {order.Id}");
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Şablon eyni qalır, amma email üçün HTTP endpoint açılmır.
        // Bu Handler-i CreateOrder tərəfindən növbəyə qoyulan job çağırır.
    }
}
