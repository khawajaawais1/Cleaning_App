namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents the status of an extension request.
/// </summary>
public enum ExtensionStatus
{
    Pending,
    Approved,
    Denied,
    AwaitingWorkerResponse
}

/// <summary>
/// Represents a request for additional time on a job.
/// </summary>
public class ExtensionRequest
{
    public int Id { get; set; }
    public int LiveJobId { get; set; }
    public LiveJob LiveJob { get; set; } = null!;
    public int RequestedMinutes { get; set; }
    public string WorkerReason { get; set; } = string.Empty;
    public ExtensionStatus Status { get; set; } = ExtensionStatus.Pending;
    public DateTime RequestedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public string? AdminNote { get; set; }
}
