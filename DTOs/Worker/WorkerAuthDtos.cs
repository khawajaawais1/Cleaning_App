namespace Happy2CleanAPI.DTOs.Worker;

public record WorkerLoginDto(string Email, string Password);

public record WorkerSignupDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string City,
    string ServiceType,
    string Password
);

public record WorkerAuthResponseDto(
    WorkerProfileDto Worker,
    string Token,
    int ExpiresIn
);

public record WorkerProfileDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string City,
    string ServiceType,
    string Status,
    double Rating,
    int CompletedJobs,
    bool IsOnline,
    string Initials,
    DateTime JoinedDate,
    DateTime? ApprovedDate
);

public record UpdateWorkerProfileDto(
    string? Phone,
    string? City,
    string? ServiceType,
    bool? IsOnline
);
