namespace VerticalSliceArch.Common;

// Demo bazası tətbiq bağlananda silinir; ayrıca baza tələb etmir.
public class FakeDatabase
{
    private readonly List<Order> orders = new();
    private readonly object syncRoot = new();

    public void Add(Order order)
    {
        // API və job paralel işləyə bilər; lock siyahını qoruyur.
        lock (syncRoot)
        {
            orders.Add(order);
        }
    }

    public List<Order> GetAll()
    {
        lock (syncRoot)
        {
            // Cavab hazırlanarkən əsas siyahı dəyişə bilər; nüsxə qaytarırıq.
            return orders.ToList();
        }
    }

    public Order? Find(Guid orderId)
    {
        lock (syncRoot)
        {
            return orders.Find(order => order.Id == orderId);
        }
    }
}
