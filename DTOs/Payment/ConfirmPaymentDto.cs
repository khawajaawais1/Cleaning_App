namespace Happy2CleanAPI.DTOs.Payment;

public class ConfirmPaymentDto
{
    public int BookingId { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
}
