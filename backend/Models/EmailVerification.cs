namespace Happy2CleanAPI.Models;

/// <summary>
/// Stores short-lived OTP codes for email verification during registration.
/// </summary>
public class EmailVerification
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }
}
