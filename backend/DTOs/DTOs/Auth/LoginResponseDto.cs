namespace Happy2CleanAPI.DTOs.Auth;

/// <summary>
/// Response DTO for login endpoint — matches the Angular frontend LoginResponse model.
/// </summary>
public record LoginResponseDto(
    UserDto User,
    string Token,
    int ExpiresIn
);

public record UserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string Role
);
