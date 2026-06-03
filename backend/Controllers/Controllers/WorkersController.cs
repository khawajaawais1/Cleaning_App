namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.Worker;

/// <summary>
/// Controller for worker management operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkersController : ControllerBase
{
    private readonly IWorkerService _workerService;

    public WorkersController(IWorkerService workerService)
    {
        _workerService = workerService;
    }

    /// <summary>
    /// Get all workers with optional status filter.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<WorkerDto>>> GetAll([FromQuery] string? status = null)
    {
        var workers = await _workerService.GetAllAsync(status);
        return Ok(workers);
    }

    /// <summary>
    /// Get a specific worker by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkerDto>> GetById(int id)
    {
        var worker = await _workerService.GetByIdAsync(id);
        if (worker == null)
        {
            return NotFound(new { message = "Worker not found" });
        }

        return Ok(worker);
    }

    /// <summary>
    /// Get all pending worker applications.
    /// </summary>
    [HttpGet("applications/pending")]
    public async Task<ActionResult<List<WorkerDto>>> GetPendingApplications()
    {
        var applications = await _workerService.GetPendingApplicationsAsync();
        return Ok(applications);
    }

    /// <summary>
    /// Approve a pending worker application.
    /// </summary>
    [HttpPut("{id}/approve")]
    public async Task<ActionResult> ApproveWorker(int id)
    {
        var success = await _workerService.ApproveWorkerAsync(id);
        if (!success)
        {
            return BadRequest(new { message = "Worker not found or not in pending status" });
        }

        return Ok(new { message = "Worker approved successfully" });
    }

    /// <summary>
    /// Reject a pending worker application.
    /// </summary>
    [HttpPut("{id}/reject")]
    public async Task<ActionResult> RejectWorker(int id, [FromBody] WorkerApplicationDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RejectionReason))
        {
            return BadRequest(new { message = "Rejection reason is required" });
        }

        var success = await _workerService.RejectWorkerAsync(id, request.RejectionReason);
        if (!success)
        {
            return BadRequest(new { message = "Worker not found or not in pending status" });
        }

        return Ok(new { message = "Worker rejected successfully" });
    }

    /// <summary>
    /// Suspend an active worker.
    /// </summary>
    [HttpPut("{id}/suspend")]
    public async Task<ActionResult> SuspendWorker(int id)
    {
        var success = await _workerService.SuspendWorkerAsync(id);
        if (!success)
        {
            return BadRequest(new { message = "Worker not found or not in active status" });
        }

        return Ok(new { message = "Worker suspended successfully" });
    }

    /// <summary>Restore a rejected or suspended worker to active status.</summary>
    [HttpPut("{id}/restore")]
    public async Task<ActionResult> RestoreWorker(int id)
    {
        var success = await _workerService.RestoreWorkerAsync(id);
        if (!success)
            return BadRequest(new { message = "Worker not found or cannot be restored from current status." });

        return Ok(new { message = "Worker restored successfully." });
    }

    /// <summary>Create a new worker.</summary>
    [HttpPost]
    public async Task<ActionResult<WorkerDto>> Create([FromBody] CreateWorkerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "FullName and Email are required" });

        try
        {
            var result = await _workerService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Update an existing worker.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<WorkerDto>> Update(int id, [FromBody] UpdateWorkerDto dto)
    {
        var result = await _workerService.UpdateAsync(id, dto);
        if (result == null) return NotFound(new { message = "Worker not found" });
        return Ok(result);
    }

    /// <summary>Delete a worker.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _workerService.DeleteAsync(id);
        if (!success) return NotFound(new { message = "Worker not found" });
        return NoContent();
    }
}
