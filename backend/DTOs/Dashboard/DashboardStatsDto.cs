namespace Happy2CleanAPI.DTOs.Dashboard;

/// <summary>
/// DTO containing dashboard statistics — matches the Angular DashboardStats interface.
/// </summary>
public record DashboardStatsDto(
    int TotalWorkers,
    int ActiveWorkers,
    int PendingApplications,
    int TotalBookings,
    int TodaysBookings,
    int ActiveJobs,
    int PendingExtensions,
    decimal TotalRevenue
);
