namespace Happy2CleanAPI.Models;

public class SystemSettings
{
    public int Id { get; set; } = 1; // single-row config table
    public bool WorkerPortalEnabled { get; set; } = false;
    public DateTime? WorkerPortalEnabledAt { get; set; }
    public DateTime? WorkerPortalDisabledAt { get; set; }
    public string? WorkerPortalDisabledReason { get; set; }
    public decimal PlatformFee { get; set; } = 5m;
    public string PlatformFeeType { get; set; } = "flat"; // "flat" | "percent"
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
