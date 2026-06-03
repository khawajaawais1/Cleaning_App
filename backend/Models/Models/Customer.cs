namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents a customer in the Happy2Clean platform.
/// </summary>
public class Customer
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    // Stripe payment method (saved card)
    public string? StripeCustomerId { get; set; }
    public string? StripePaymentMethodId { get; set; }
    public string? CardLast4 { get; set; }
    public string? CardBrand { get; set; }
    public int? CardExpMonth { get; set; }
    public int? CardExpYear { get; set; }
}
