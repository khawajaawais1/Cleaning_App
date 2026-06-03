namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents the status of a booking.
/// </summary>
public enum BookingStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}

/// <summary>
/// Represents the type of cleaning service.
/// </summary>
public enum ServiceType
{
    StandardClean,
    DeepClean,
    MoveInOut,
    PostConstruction
}

/// <summary>
/// Represents a cleaning booking in the Happy2Clean platform.
/// </summary>
public class Booking
{
    public int Id { get; set; }
    public string BookingNumber { get; set; } = string.Empty; // BK-XXXX
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int? WorkerId { get; set; }
    public Worker? Worker { get; set; }
    public ServiceType ServiceType { get; set; }
    public string Address { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Scheduled;
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? PaymentIntentId { get; set; }
    public string PaymentStatus { get; set; } = "pending"; // pending | paid | failed
    public int? CustomerRating { get; set; }      // 1–5
    public string? CustomerReview { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public LiveJob? LiveJob { get; set; }
}
