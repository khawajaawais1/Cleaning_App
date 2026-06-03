namespace Happy2CleanAPI.Models;

/// <summary>
/// Represents an admin user account for the Happy2Clean platform.
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin"; // "Admin", "SuperAdmin"
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
