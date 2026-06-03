namespace Happy2CleanAPI.DTOs.Payment;

public class SetupIntentResponseDto
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
}
