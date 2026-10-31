namespace VerticalSliceArch.Common;

// Ortaq model sayəsində feature-lər eyni sifariş quruluşunu tanıyır.
public class Order
{
    // Guid hər sifariş üçün ayrıca identifikator verir.
    public Guid Id { get; init; }
    public string Email { get; init; } = "";
    public string ProductName { get; init; } = "";
}
