namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents the status of a live job.
/// </summary>
public enum LiveJobStatus
{
    NotStarted,
    InProgress,
    OnBreak,
    Completed
}

/// <summary>
/// Represents a live job tracking entry in the Happy2Clean platform.
/// </summary>
public class LiveJob
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    public DateTime? StartedAt { get; set; }
    public DateTime? EstimatedEndTime { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public LiveJobStatus Status { get; set; } = LiveJobStatus.NotStarted;
    public int ProgressMinutes { get; set; } = 0;
    public string? WorkerNotes { get; set; }
    public ICollection<ExtensionRequest> ExtensionRequests { get; set; } = new List<ExtensionRequest>();
}
