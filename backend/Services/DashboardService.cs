namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Dashboard;
using Happy2CleanAPI.DTOs.Booking;
using Happy2CleanAPI.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for dashboard operations.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var totalWorkers = await _context.Workers.CountAsync();
        var activeWorkers = await _context.Workers
            .CountAsync(w => w.Status == WorkerStatus.Active);
        var pendingApplications = await _context.Workers
            .CountAsync(w => w.Status == WorkerStatus.Pending);
        var totalBookings = await _context.Bookings.CountAsync();
        var todaysBookings = await _context.Bookings
            .CountAsync(b => b.ScheduledAt.Date == now.Date || b.CreatedAt.Date == now.Date);
        var activeJobs = await _context.LiveJobs
            .CountAsync(lj => lj.Status == LiveJobStatus.InProgress);
        var pendingExtensions = await _context.ExtensionRequests
            .CountAsync(er => er.Status == ExtensionStatus.Pending);
        var totalRevenue = await _context.Bookings
            .Where(b => b.CreatedAt >= monthStart && b.Status == BookingStatus.Completed)
            .SumAsync(b => b.Price);

        return new DashboardStatsDto(
            totalWorkers,
            activeWorkers,
            pendingApplications,
            totalBookings,
            todaysBookings,
            activeJobs,
            pendingExtensions,
            totalRevenue
        );
    }

    public async Task<List<BookingDto>> GetRecentBookingsAsync()
    {
        var bookings = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Worker)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
    }

    private static BookingDto MapToDto(Booking booking)
    {
        var customerParts = booking.Customer?.FullName?.Split(' ', 2) ?? [];
        var workerParts   = booking.Worker?.FullName?.Split(' ', 2) ?? [];
        var endTime       = booking.ScheduledAt.AddMinutes(booking.DurationMinutes);
        var status = booking.Status switch
        {
            BookingStatus.Scheduled  => "scheduled",
            BookingStatus.InProgress => "in_progress",
            BookingStatus.Completed  => "completed",
            BookingStatus.Cancelled  => "cancelled",
            _                        => "scheduled"
        };
        return new BookingDto(
            Id:           booking.Id.ToString(),
            BookingNumber: booking.BookingNumber,
            CustomerId:   booking.CustomerId.ToString(),
            Customer:     booking.Customer == null ? null : new BookingCustomerDto(
                              customerParts.Length > 0 ? customerParts[0] : "",
                              customerParts.Length > 1 ? customerParts[1] : "",
                              booking.Customer.Email,
                              booking.Customer.Phone),
            WorkerId:     booking.WorkerId?.ToString(),
            Worker:       booking.Worker == null ? null : new BookingWorkerDto(
                              workerParts.Length > 0 ? workerParts[0] : "",
                              workerParts.Length > 1 ? workerParts[1] : "",
                              booking.Worker.Rating),
            ServiceType:  booking.ServiceType.ToString(),
            Address:      booking.Address,
            Latitude:     booking.Latitude,
            Longitude:    booking.Longitude,
            StartTime:    booking.ScheduledAt,
            EndTime:      endTime,
            Duration:     booking.DurationMinutes,
            Price:        booking.Price,
            Status:       status,
            Notes:        booking.Notes,
            CreatedAt:    booking.CreatedAt,
            UpdatedAt:    booking.CreatedAt
        );
    }
}
