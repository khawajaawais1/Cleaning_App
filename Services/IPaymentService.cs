using Happy2CleanAPI.DTOs.Payment;

namespace Happy2CleanAPI.Services;

public interface IPaymentService
{
    Task<SavedCardDto> GetSavedCardAsync(int customerId);
    Task<SetupIntentResponseDto> CreateSetupIntentAsync(int customerId);
    Task<SavedCardDto> SaveCardAsync(int customerId, string paymentMethodId);
    Task<PaymentIntentResponseDto> CreatePaymentIntentAsync(int customerId, CreatePaymentIntentDto dto);
    Task<bool> ConfirmPaymentAsync(ConfirmPaymentDto dto);
}
