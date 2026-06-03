namespace Happy2CleanAPI.DTOs.Auth;

/// <summary>
/// Request DTO for login endpoint.
/// </summary>
public record LoginRequestDto(
    string Email,
    string Password
);
