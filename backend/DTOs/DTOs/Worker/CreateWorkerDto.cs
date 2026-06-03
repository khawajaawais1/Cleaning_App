namespace Happy2CleanAPI.DTOs.Worker;

public record CreateWorkerDto(
    string FullName,
    string Email,
    string? Password,
    string Phone,
    string City,
    string ServiceType,
    double Rating,
    int CompletedJobs,
    bool IsOnline
);

public record UpdateWorkerDto(
    string FullName,
    string Email,
    string Phone,
    string City,
    string ServiceType,
    double Rating,
    int CompletedJobs,
    bool IsOnline,
    string? Status
);
