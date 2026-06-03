namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents the status of a worker application.
/// </summary>
public enum WorkerStatus
{
    Pending,
    Active,
    Rejected,
    Suspended
}

/// <summary>
/// Represents a cleaning worker in the Happy2Clean platform.
/// </summary>
public class Worker
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public WorkerStatus Status { get; set; } = WorkerStatus.Pending;
    public string ServiceType { get; set; } = string.Empty; // "Deep Clean", "Standard Clean", etc.
    public DateTime AppliedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public double Rating { get; set; } = 0;
    public int CompletedJobs { get; set; } = 0;
    public string City { get; set; } = string.Empty;
    public bool IsOnline { get; set; } = false;
    public string? PasswordHash { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime? LastLocationUpdate { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<WorkerDocument> Documents { get; set; } = new List<WorkerDocument>();
}
