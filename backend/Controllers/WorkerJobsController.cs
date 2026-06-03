namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Worker;
using System.Security.Claims;

[ApiController]
[Route("api/worker/jobs")]
[Authorize(Roles = "Worker")]
public class WorkerJobsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public WorkerJobsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetMyJobs()
    {
        var workerId = GetWorkerId();
        var bookings = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.LiveJob)
                .ThenInclude(lj => lj!.ExtensionRequests)
            .Where(b => b.WorkerId == workerId && b.Status != BookingStatus.Cancelled)
            .OrderByDescending(b => b.ScheduledAt)
            .ToListAsync();

        return Ok(bookings.Select(MapToJobDto));
    }

    [HttpGet("invites")]
    public IActionResult GetInvites()
    {
        // Future phase: auto-dispatch to nearest 5 workers.
        // Currently admin assigns workers directly. Return empty list.
        return Ok(Array.Empty<WorkerJobInviteDto>());
    }

    [HttpPost("{id}/en-route")]
    public async Task<IActionResult> MarkEnRoute(int id)
    {
        var booking = await GetWorkerBooking(id);
        if (booking == null) return NotFound();
        if (booking.Status != BookingStatus.Scheduled)
            return BadRequest(new { message = "Job is not in Scheduled status." });

        // Optionally update notes — no status change needed; just confirms worker is heading over
        return Ok(MapToJobDto(booking));
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartJob(int id)
    {
        var booking = await GetWorkerBooking(id);
        if (booking == null) return NotFound();
        if (booking.Status != BookingStatus.Scheduled)
            return BadRequest(new { message = "Job cannot be started in its current state." });

        booking.Status = BookingStatus.InProgress;

        var liveJob = booking.LiveJob ?? new LiveJob { BookingId = booking.Id };
        liveJob.Status = LiveJobStatus.InProgress;
        liveJob.StartedAt = DateTime.UtcNow;
        liveJob.EstimatedEndTime = DateTime.UtcNow.AddMinutes(booking.DurationMinutes);

        if (booking.LiveJob == null) _db.LiveJobs.Add(liveJob);

        await _db.SaveChangesAsync();
        return Ok(MapToJobDto(booking));
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteJob(int id)
    {
        var booking = await GetWorkerBooking(id);
        if (booking == null) return NotFound();
        if (booking.Status != BookingStatus.InProgress)
            return BadRequest(new { message = "Job is not in progress." });

        booking.Status = BookingStatus.Completed;

        if (booking.LiveJob != null)
        {
            booking.LiveJob.Status = LiveJobStatus.Completed;
            booking.LiveJob.ActualEndTime = DateTime.UtcNow;
        }

        // Increment worker's completed jobs
        var worker = await _db.Workers.FindAsync(GetWorkerId());
        if (worker != null) worker.CompletedJobs++;

        await _db.SaveChangesAsync();
        return Ok(MapToJobDto(booking));
    }

    [HttpPost("{id}/extension")]
    public async Task<IActionResult> RequestExtension(int id, [FromBody] RequestExtensionDto dto)
    {
        var booking = await GetWorkerBooking(id);
        if (booking == null) return NotFound();
        if (booking.Status != BookingStatus.InProgress)
            return BadRequest(new { message = "Job is not in progress." });

        var liveJob = booking.LiveJob;
        if (liveJob == null) return BadRequest(new { message = "No active live job found." });

        var existing = liveJob.ExtensionRequests.FirstOrDefault(e => e.Status == ExtensionStatus.Pending);
        if (existing != null)
            return BadRequest(new { message = "An extension request is already pending." });

        var extRequest = new ExtensionRequest
        {
            LiveJobId = liveJob.Id,
            RequestedMinutes = dto.Minutes,
            WorkerReason = dto.Reason,
            Status = ExtensionStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        _db.ExtensionRequests.Add(extRequest);
        await _db.SaveChangesAsync();

        var originalEnd = liveJob.EstimatedEndTime ?? DateTime.UtcNow;
        return Ok(new WorkerJobExtensionDto(
            Id: extRequest.Id,
            RequestedMinutes: dto.Minutes,
            Reason: dto.Reason,
            Status: "pending",
            SubmittedAt: extRequest.RequestedAt,
            OriginalEnd: originalEnd.ToString("HH:mm"),
            NewEnd: originalEnd.AddMinutes(dto.Minutes).ToString("HH:mm")
        ));
    }

    private async Task<Booking?> GetWorkerBooking(int bookingId)
    {
        var workerId = GetWorkerId();
        return await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.LiveJob)
                .ThenInclude(lj => lj!.ExtensionRequests)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.WorkerId == workerId);
    }

    private int GetWorkerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static WorkerJobDto MapToJobDto(Booking b)
    {
        var start = b.ScheduledAt.ToString("HH:mm");
        var end = b.ScheduledAt.AddMinutes(b.DurationMinutes).ToString("HH:mm");
        var customer = b.Customer;
        var customerInitials = string.Concat(customer.FullName.Split(' ').Take(2).Select(p => p[0])).ToUpper();

        var pendingExt = b.LiveJob?.ExtensionRequests
            .FirstOrDefault(e => e.Status == ExtensionStatus.Pending);

        WorkerJobExtensionDto? extDto = null;
        if (pendingExt != null && b.LiveJob != null)
        {
            var origEnd = b.LiveJob.EstimatedEndTime ?? b.ScheduledAt.AddMinutes(b.DurationMinutes);
            extDto = new WorkerJobExtensionDto(
                Id: pendingExt.Id,
                RequestedMinutes: pendingExt.RequestedMinutes,
                Reason: pendingExt.WorkerReason,
                Status: pendingExt.Status.ToString().ToLower(),
                SubmittedAt: pendingExt.RequestedAt,
                OriginalEnd: origEnd.ToString("HH:mm"),
                NewEnd: origEnd.AddMinutes(pendingExt.RequestedMinutes).ToString("HH:mm")
            );
        }

        var status = b.Status switch
        {
            BookingStatus.Scheduled => "assigned",
            BookingStatus.InProgress when pendingExt != null => "extension_requested",
            BookingStatus.InProgress => "in_progress",
            BookingStatus.Completed => "completed",
            BookingStatus.Cancelled => "cancelled",
            _ => "assigned"
        };

        var addressParts = b.Address.Split(',');
        var postcode = addressParts.Length > 1 ? addressParts.Last().Trim() : "";
        var streetAddr = addressParts.Length > 1 ? string.Join(",", addressParts.Take(addressParts.Length - 1)).Trim() : b.Address;

        return new WorkerJobDto(
            Id: b.Id,
            BookingRef: b.BookingNumber,
            ServiceType: b.ServiceType.ToString(),
            Status: status,
            Customer: new WorkerJobCustomerDto(customer.Id, customer.FullName, customer.Phone, customerInitials),
            Location: new WorkerJobLocationDto(streetAddr, "", postcode, b.Latitude, b.Longitude),
            ScheduledDate: b.ScheduledAt,
            ScheduledStart: start,
            ScheduledEnd: end,
            DurationMinutes: b.DurationMinutes,
            Notes: b.Notes,
            Earnings: b.Price,
            ExtensionRequest: extDto,
            LiveJobId: b.LiveJob?.Id
        );
    }
}
