namespace Happy2CleanAPI.DTOs.Worker;

public record WorkerJobDto(
    int Id,
    string BookingRef,
    string ServiceType,
    string Status,
    WorkerJobCustomerDto Customer,
    WorkerJobLocationDto Location,
    DateTime ScheduledDate,
    string ScheduledStart,
    string ScheduledEnd,
    int DurationMinutes,
    string? Notes,
    decimal Earnings,
    WorkerJobExtensionDto? ExtensionRequest,
    int? LiveJobId
);

public record WorkerJobCustomerDto(int Id, string Name, string Phone, string Initials);

public record WorkerJobLocationDto(string Address, string City, string Postcode, double? Lat, double? Lng);

public record WorkerJobExtensionDto(
    int Id,
    int RequestedMinutes,
    string Reason,
    string Status,
    DateTime SubmittedAt,
    string OriginalEnd,
    string NewEnd
);

public record RequestExtensionDto(int Minutes, string Reason);

public record WorkerJobInviteDto(
    int Id,
    WorkerJobDto Job,
    DateTime ExpiresAt,
    double DistanceKm
);
