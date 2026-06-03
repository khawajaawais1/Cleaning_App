namespace Happy2CleanAPI.DTOs.Payment;

public class CreatePaymentIntentDto
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "eur";
}
