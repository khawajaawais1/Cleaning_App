namespace Happy2CleanAPI.Models;

public class ServiceRate
{
    public int Id { get; set; }
    public string ServiceType { get; set; } = string.Empty; // "StandardClean", "DeepClean", etc.
    public string Label { get; set; } = string.Empty;       // "Standard clean"
    public string Tagline { get; set; } = string.Empty;     // "Regular tidy — surfaces, floors, bathrooms"
    public string Icon { get; set; } = string.Empty;        // emoji
    public decimal RatePerHour { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
