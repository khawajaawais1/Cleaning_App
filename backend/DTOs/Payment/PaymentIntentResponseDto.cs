namespace Happy2CleanAPI.DTOs.Payment;

public class PaymentIntentResponseDto
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public long AmountCents { get; set; }
    public string PublishableKey { get; set; } = string.Empty;
}
