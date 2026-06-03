namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.Dashboard;
using Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// Service interface for dashboard operations.
/// </summary>
public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<List<BookingDto>> GetRecentBookingsAsync();
}
