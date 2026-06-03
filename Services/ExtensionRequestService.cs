namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.ExtensionRequest;
using Happy2CleanAPI.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for extension request operations.
/// </summary>
public class ExtensionRequestService : IExtensionRequestService
{
    private readonly ApplicationDbContext _context;

    public ExtensionRequestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExtensionRequestDto>> GetAllAsync(string? statusFilter = null)
    {
        var query = _context.ExtensionRequests
            .Include(er => er.LiveJob)
            .ThenInclude(lj => lj.Booking)
            .ThenInclude(b => b.Worker)
            .Include(er => er.LiveJob).ThenInclude(lj => lj.Booking).ThenInclude(b => b.Customer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<ExtensionStatus>(statusFilter, true, out var status))
        {
            query = query.Where(er => er.Status == status);
        }

        var extensionRequests = await query
            .OrderByDescending(er => er.RequestedAt)
            .ToListAsync();

        return extensionRequests.Select(MapToDto).ToList();
    }

    public async Task<ExtensionRequestDto?> GetByIdAsync(int id)
    {
        var extensionRequest = await _context.ExtensionRequests
            .Include(er => er.LiveJob)
            .ThenInclude(lj => lj.Booking)
            .ThenInclude(b => b.Worker)
            .Include(er => er.LiveJob).ThenInclude(lj => lj.Booking).ThenInclude(b => b.Customer)
            .FirstOrDefaultAsync(er => er.Id == id);

        return extensionRequest == null ? null : MapToDto(extensionRequest);
    }

    public async Task<bool> ApproveAsync(int id, string? adminNote = null)
    {
        var extensionRequest = await _context.ExtensionRequests.FindAsync(id);
        if (extensionRequest == null || extensionRequest.Status != ExtensionStatus.Pending)
            return false;

        extensionRequest.Status = ExtensionStatus.Approved;
        extensionRequest.DecidedAt = DateTime.UtcNow;
        extensionRequest.AdminNote = adminNote;

        var liveJob = await _context.LiveJobs.FindAsync(extensionRequest.LiveJobId);
        if (liveJob != null)
        {
            liveJob.EstimatedEndTime = liveJob.EstimatedEndTime?.AddMinutes(extensionRequest.RequestedMinutes);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DenyAsync(int id, string? adminNote = null)
    {
        var extensionRequest = await _context.ExtensionRequests.FindAsync(id);
        if (extensionRequest == null || extensionRequest.Status != ExtensionStatus.Pending)
            return false;

        extensionRequest.Status = ExtensionStatus.Denied;
        extensionRequest.DecidedAt = DateTime.UtcNow;
        extensionRequest.AdminNote = adminNote;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AskWorkerAsync(int id, string? adminNote = null)
    {
        var extensionRequest = await _context.ExtensionRequests.FindAsync(id);
        if (extensionRequest == null || extensionRequest.Status != ExtensionStatus.Pending)
            return false;

        extensionRequest.Status = ExtensionStatus.AwaitingWorkerResponse;
        extensionRequest.DecidedAt = DateTime.UtcNow;
        extensionRequest.AdminNote = adminNote;

        await _context.SaveChangesAsync();
        return true;
    }

    private static ExtensionRequestDto MapToDto(ExtensionRequest extensionRequest)
    {
        var liveJob  = extensionRequest.LiveJob;
        var booking  = liveJob?.Booking;
        var worker   = booking?.Worker;
        var customer = booking?.Customer;

        var workerNameParts   = worker?.FullName?.Split(' ', 2) ?? [];
        var customerNameParts = customer?.FullName?.Split(' ', 2) ?? [];

        var originalEndTime = liveJob?.EstimatedEndTime ?? DateTime.UtcNow;
        var newEndTime      = originalEndTime.AddMinutes(extensionRequest.RequestedMinutes);

        var completedMinutes = liveJob?.ProgressMinutes ?? 0;
        var totalMinutes     = booking?.DurationMinutes ?? 0;

        // Map status to frontend expected strings
        var status = extensionRequest.Status switch
        {
            ExtensionStatus.Pending                => "pending",
            ExtensionStatus.Approved               => "approved",
            ExtensionStatus.Denied                 => "denied",
            ExtensionStatus.AwaitingWorkerResponse => "asked_worker",
            _                                      => "pending"
        };

        return new ExtensionRequestDto(
            Id:               extensionRequest.Id.ToString(),
            BookingId:        booking?.Id.ToString() ?? "0",
            BookingNumber:    booking?.BookingNumber ?? string.Empty,
            WorkerId:         worker?.Id.ToString() ?? "0",
            Worker:           new ExtensionWorkerDto(
                                  FirstName: workerNameParts.Length > 0 ? workerNameParts[0] : "",
                                  LastName:  workerNameParts.Length > 1 ? workerNameParts[1] : ""),
            CustomerId:       customer?.Id.ToString() ?? "0",
            Customer:         new ExtensionCustomerDto(
                                  FirstName: customerNameParts.Length > 0 ? customerNameParts[0] : "",
                                  LastName:  customerNameParts.Length > 1 ? customerNameParts[1] : ""),
            JobType:          booking?.ServiceType.ToString() ?? string.Empty,
            OriginalEndTime:  originalEndTime,
            NewEndTime:       newEndTime,
            RequestedMinutes: extensionRequest.RequestedMinutes,
            Reason:           extensionRequest.WorkerReason,
            Status:           status,
            JobProgress:      new JobProgressDto(completedMinutes, totalMinutes),
            RequestedAt:      extensionRequest.RequestedAt,
            ResolvedAt:       extensionRequest.DecidedAt,
            DenialNote:       extensionRequest.AdminNote
        );
    }
}
