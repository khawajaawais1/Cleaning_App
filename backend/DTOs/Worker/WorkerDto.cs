namespace Happy2CleanAPI.DTOs.Worker;

/// <summary>
/// DTO for worker information — matches the Angular Worker model.
/// </summary>
public record WorkerDto(
    string Id,
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
    DateTime AppliedDate,
    DateTime? ApprovedDate,
    string? RejectionReason
);
