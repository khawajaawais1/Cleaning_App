namespace Happy2CleanAPI.Services;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string toEmail, string toName, string code);
}
