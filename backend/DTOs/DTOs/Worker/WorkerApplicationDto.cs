namespace Happy2CleanAPI.DTOs.Worker;

/// <summary>
/// DTO for worker application with rejection reason input.
/// </summary>
public record WorkerApplicationDto(
    string? RejectionReason,
    string? AdminNote
);
