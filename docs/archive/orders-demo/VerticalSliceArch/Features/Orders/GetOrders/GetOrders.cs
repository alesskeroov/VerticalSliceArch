using VerticalSliceArch.Common;

namespace VerticalSliceArch.Features.Orders.GetOrders;

// Statik qabıq bu feature-in məntiqini və endpoint-ini birləşdirir.
public static class GetOrders
{
    // GET gövdə qəbul etmədiyi üçün Request record lazım deyil.
    public class Handler
    {
        private readonly FakeDatabase database;

        // DI eyni singleton bazanı verir.
        public Handler(FakeDatabase database)
        {
            this.database = database;
        }

        public IResult Handle()
        {
            // Minimal API siyahını JSON cavabına çevirir.
            return Results.Ok(database.GetAll());
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Handler DI-dan alınır; endpoint yalnız işi ona ötürür.
        app.MapGet("/orders", (Handler handler) => handler.Handle());
    }
}
