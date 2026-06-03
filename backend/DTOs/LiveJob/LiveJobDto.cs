namespace Happy2CleanAPI.DTOs.LiveJob;

/// <summary>
/// DTO for live job information — matches the Angular LiveJob model.
/// </summary>
public record LiveJobDto(
    string Id,
    string BookingId,
    string BookingNumber,
    string WorkerId,
    LiveJobWorkerDto Worker,
    string CustomerId,
    LiveJobCustomerDto Customer,
    string JobType,
    string Status,
    DateTime StartTime,
    DateTime EstimatedEndTime,
    DateTime? ActualEndTime,
    int ProgressPercentage,
    DateTime LastUpdateTime
);

public record LiveJobWorkerDto(string FirstName, string LastName, string Phone, double Rating);
public record LiveJobCustomerDto(string FirstName, string LastName, string Address);
