namespace Happy2CleanAPI.DTOs.ExtensionRequest;

/// <summary>
/// DTO for extension request — matches the Angular ExtensionRequest model.
/// </summary>
public record ExtensionRequestDto(
    string Id,
    string BookingId,
    string BookingNumber,
    string WorkerId,
    ExtensionWorkerDto Worker,
    string CustomerId,
    ExtensionCustomerDto Customer,
    string JobType,
    DateTime OriginalEndTime,
    DateTime NewEndTime,
    int RequestedMinutes,
    string Reason,
    string Status,
    JobProgressDto JobProgress,
    DateTime RequestedAt,
    DateTime? ResolvedAt,
    string? DenialNote
);

public record ExtensionWorkerDto(string FirstName, string LastName);
public record ExtensionCustomerDto(string FirstName, string LastName);
public record JobProgressDto(int CompletedMinutes, int TotalMinutes);
