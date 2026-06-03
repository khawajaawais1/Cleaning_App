namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.LiveJob;
using Happy2CleanAPI.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for live job operations.
/// </summary>
public class LiveJobService : ILiveJobService
{
    private readonly ApplicationDbContext _context;

    public LiveJobService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LiveJobDto>> GetAllActiveAsync()
    {
        var liveJobs = await _context.LiveJobs
            .Include(lj => lj.Booking)
            .ThenInclude(b => b.Customer)
            .Include(lj => lj.Booking)
            .ThenInclude(b => b.Worker)
            .Where(lj => lj.Status == LiveJobStatus.InProgress || lj.Status == LiveJobStatus.OnBreak)
            .OrderByDescending(lj => lj.StartedAt)
            .ToListAsync();

        return liveJobs.Select(MapToDto).ToList();
    }

    public async Task<LiveJobDto?> GetByIdAsync(int id)
    {
        var liveJob = await _context.LiveJobs
            .Include(lj => lj.Booking)
            .ThenInclude(b => b.Customer)
            .Include(lj => lj.Booking)
            .ThenInclude(b => b.Worker)
            .Include(lj => lj.Booking).ThenInclude(b => b.Customer)
            .FirstOrDefaultAsync(lj => lj.Id == id);

        return liveJob == null ? null : MapToDto(liveJob);
    }

    public async Task<bool> StartJobAsync(int id)
    {
        var liveJob = await _context.LiveJobs.FindAsync(id);
        if (liveJob == null || liveJob.Status != LiveJobStatus.NotStarted)
            return false;

        liveJob.Status = LiveJobStatus.InProgress;
        liveJob.StartedAt = DateTime.UtcNow;

        var booking = await _context.Bookings.FindAsync(liveJob.BookingId);
        if (booking != null)
        {
            booking.Status = BookingStatus.InProgress;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CompleteJobAsync(int id)
    {
        var liveJob = await _context.LiveJobs.FindAsync(id);
        if (liveJob == null || (liveJob.Status != LiveJobStatus.InProgress && liveJob.Status != LiveJobStatus.OnBreak))
            return false;

        liveJob.Status = LiveJobStatus.Completed;
        liveJob.ActualEndTime = DateTime.UtcNow;

        var booking = await _context.Bookings.FindAsync(liveJob.BookingId);
        if (booking != null)
        {
            booking.Status = BookingStatus.Completed;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private static LiveJobDto MapToDto(LiveJob liveJob)
    {
        var booking  = liveJob.Booking;
        var worker   = booking?.Worker;
        var customer = booking?.Customer;

        var workerParts   = worker?.FullName?.Split(' ', 2) ?? [];
        var customerParts = customer?.FullName?.Split(' ', 2) ?? [];

        var totalMinutes = booking?.DurationMinutes ?? 60;
        var elapsed      = liveJob.ProgressMinutes;
        var progress     = totalMinutes > 0 ? Math.Min(100, (int)(elapsed * 100.0 / totalMinutes)) : 0;

        var status = liveJob.Status switch
        {
            LiveJobStatus.InProgress => "in_progress",
            LiveJobStatus.OnBreak    => "on_break",
            LiveJobStatus.Completed  => "completing_soon",
            _                        => "in_progress"
        };

        return new LiveJobDto(
            Id:                 liveJob.Id.ToString(),
            BookingId:          liveJob.BookingId.ToString(),
            BookingNumber:      booking?.BookingNumber ?? string.Empty,
            WorkerId:           worker?.Id.ToString() ?? "0",
            Worker:             new LiveJobWorkerDto(
                                    FirstName: workerParts.Length > 0 ? workerParts[0] : "",
                                    LastName:  workerParts.Length > 1 ? workerParts[1] : "",
                                    Phone:     worker?.Phone ?? "",
                                    Rating:    worker?.Rating ?? 0),
            CustomerId:         customer?.Id.ToString() ?? "0",
            Customer:           new LiveJobCustomerDto(
                                    FirstName: customerParts.Length > 0 ? customerParts[0] : "",
                                    LastName:  customerParts.Length > 1 ? customerParts[1] : "",
                                    Address:   customer?.Address ?? booking?.Address ?? ""),
            JobType:            booking?.ServiceType.ToString() ?? string.Empty,
            Status:             status,
            StartTime:          liveJob.StartedAt ?? DateTime.UtcNow,
            EstimatedEndTime:   liveJob.EstimatedEndTime ?? DateTime.UtcNow,
            ActualEndTime:      liveJob.ActualEndTime,
            ProgressPercentage: progress,
            LastUpdateTime:     DateTime.UtcNow
        );
    }
}
