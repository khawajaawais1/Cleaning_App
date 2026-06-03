namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// Controller for booking management operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    /// <summary>
    /// Get all bookings with optional filters.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<BookingDto>>> GetAll([FromQuery] string? status = null, [FromQuery] DateTime? date = null)
    {
        var bookings = await _bookingService.GetAllAsync(status, date);
        return Ok(bookings);
    }

    /// <summary>
    /// Get a specific booking by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var booking = await _bookingService.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Booking not found" });
        }

        return Ok(booking);
    }

    /// <summary>
    /// Create a new booking.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create([FromBody] CreateBookingDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ServiceType) || string.IsNullOrWhiteSpace(request.Address))
        {
            return BadRequest(new { message = "ServiceType and Address are required" });
        }

        try
        {
            var booking = await _bookingService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing booking.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] CreateBookingDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ServiceType) || string.IsNullOrWhiteSpace(request.Address))
        {
            return BadRequest(new { message = "ServiceType and Address are required" });
        }

        var success = await _bookingService.UpdateAsync(id, request);
        if (!success)
        {
            return BadRequest(new { message = "Booking not found or cannot be updated in current status" });
        }

        return Ok(new { message = "Booking updated successfully" });
    }

    /// <summary>
    /// Update only the status of a booking (admin: Scheduled → InProgress → Completed).
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto request)
    {
        var success = await _bookingService.UpdateStatusAsync(id, request.Status);
        if (!success)
            return BadRequest(new { message = $"Booking not found or invalid status '{request.Status}'." });

        return Ok(new { message = $"Status updated to {request.Status}" });
    }

    /// <summary>
    /// Assign a worker to a booking.
    /// </summary>
    [HttpPut("{id}/assign-worker")]
    public async Task<ActionResult> AssignWorker(int id, [FromBody] AssignWorkerDto request)
    {
        var success = await _bookingService.AssignWorkerAsync(id, request.WorkerId);
        if (!success)
        {
            return BadRequest(new { message = "Booking not found, already completed/cancelled, or worker not found" });
        }

        return Ok(new { message = "Worker assigned successfully" });
    }

    /// <summary>
    /// Cancel a booking (sets status to Cancelled).
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Cancel(int id)
    {
        var success = await _bookingService.CancelAsync(id);
        if (!success)
            return BadRequest(new { message = "Booking not found or cannot be cancelled" });

        return Ok(new { message = "Booking cancelled successfully" });
    }

    /// <summary>
    /// Permanently delete a cancelled booking from the database.
    /// </summary>
    [HttpDelete("{id}/purge")]
    public async Task<ActionResult> PurgeBooking(int id)
    {
        var success = await _bookingService.DeletePermanentAsync(id);
        if (!success)
            return BadRequest(new { message = "Booking not found or must be cancelled before deleting." });

        return Ok(new { message = "Booking permanently deleted." });
    }
}

public record AssignWorkerDto(int WorkerId);
public record UpdateStatusDto(string Status);
