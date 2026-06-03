namespace Happy2CleanAPI.DTOs.Payment;

public class SavedCardDto
{
    public bool HasCard { get; set; }
    public string? Last4 { get; set; }
    public string? Brand { get; set; }
    public int? ExpMonth { get; set; }
    public int? ExpYear { get; set; }
    public string? PaymentMethodId { get; set; }
}
