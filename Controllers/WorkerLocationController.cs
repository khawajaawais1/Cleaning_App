namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Worker;
using Happy2CleanAPI.Services;
using System.Security.Claims;

[ApiController]
[Route("api/worker/location")]
[Authorize(Roles = "Worker")]
public class WorkerLocationController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILocationPublisher _publisher;
    private readonly ILogger<WorkerLocationController> _logger;

    public WorkerLocationController(
        ApplicationDbContext db,
        ILocationPublisher publisher,
        ILogger<WorkerLocationController> logger)
    {
        _db = db;
        _publisher = publisher;
        _logger = logger;
    }

    /// <summary>
    /// Called by the worker app every ~15 seconds while a job is active.
    /// Persists the worker's last known coordinates and publishes to Service Bus
    /// so the Azure Function can broadcast via Azure Web PubSub to admin/customer.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdateDto dto)
    {
        var workerId = GetWorkerId();

        // Persist last known location on the Worker row
        var worker = await _db.Workers.FindAsync(workerId);
        if (worker == null) return NotFound();

        worker.Latitude = dto.Latitude;
        worker.Longitude = dto.Longitude;
        worker.LastLocationUpdate = DateTime.UtcNow;

        // Resolve the active booking ID: use the provided one or find the active job
        var bookingId = dto.ActiveBookingId;
        if (bookingId == null)
        {
            var activeBooking = await _db.Bookings
                .Where(b => b.WorkerId == workerId && b.Status == BookingStatus.InProgress)
                .FirstOrDefaultAsync();
            bookingId = activeBooking?.Id;
        }

        await _db.SaveChangesAsync();

        // Publish to Service Bus only when there is an active booking
        if (bookingId.HasValue)
        {
            var message = new LocationMessage(
                WorkerId: workerId,
                WorkerName: worker.FullName,
                BookingId: bookingId.Value,
                Latitude: dto.Latitude,
                Longitude: dto.Longitude,
                Timestamp: DateTime.UtcNow
            );

            try
            {
                await _publisher.PublishAsync(message);
            }
            catch (Exception ex)
            {
                // Non-fatal: log and continue. Location is already persisted.
                _logger.LogWarning(ex, "Failed to publish location to Service Bus for worker {WorkerId}", workerId);
            }
        }

        return Ok(new { received = true, bookingId });
    }

    private int GetWorkerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
