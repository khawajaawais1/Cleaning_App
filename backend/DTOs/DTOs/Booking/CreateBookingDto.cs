namespace Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// DTO for creating a new booking.
/// </summary>
public record CreateBookingDto(
    int CustomerId,
    int? WorkerId,
    string ServiceType,
    string Address,
    DateTime ScheduledAt,
    int DurationMinutes,
    decimal Price,
    string? Notes
);
