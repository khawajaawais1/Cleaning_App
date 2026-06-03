namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.Auth;

/// <summary>
/// Service interface for authentication operations.
/// </summary>
public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(string email, string password);
    Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
    Task<LoginResponseDto?> GetCurrentUserAsync(int userId);
}
