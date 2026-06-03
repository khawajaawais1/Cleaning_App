namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.Dashboard;
using Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// Controller for dashboard operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Get dashboard statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Get recent bookings (last 5).
    /// </summary>
    [HttpGet("recent-bookings")]
    public async Task<ActionResult<List<BookingDto>>> GetRecentBookings()
    {
        var bookings = await _dashboardService.GetRecentBookingsAsync();
        return Ok(bookings);
    }
}
