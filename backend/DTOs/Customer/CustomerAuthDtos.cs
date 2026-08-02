namespace Happy2CleanAPI.DTOs.Customer;

public record CustomerRegisterDto(
    string FullName,
    string Email,
    string Phone,
    string Address,
    string Password,
    string VerificationCode
);

public record SendVerificationDto(string Email, string FullName);

public record CustomerLoginDto(
    string Email,
    string Password
);

public record CustomerTokenDto(
    string Token,
    string FullName,
    string Email,
    int CustomerId
);

public record CustomerProfileDto(
    int Id,
    string FullName,
    string Email,
    string Phone,
    string Address,
    DateTime CreatedAt
);

public record GoogleLoginDto(string IdToken);
