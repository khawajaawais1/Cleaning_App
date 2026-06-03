namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.LiveJob;

/// <summary>
/// Controller for live job tracking operations.
/// </summary>
[ApiController]
[Route("api/live-jobs")]
[Authorize]
public class LiveJobsController : ControllerBase
{
    private readonly ILiveJobService _liveJobService;

    public LiveJobsController(ILiveJobService liveJobService)
    {
        _liveJobService = liveJobService;
    }

    /// <summary>
    /// Get all active live jobs (InProgress or OnBreak).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<LiveJobDto>>> GetAllActive()
    {
        var liveJobs = await _liveJobService.GetAllActiveAsync();
        return Ok(liveJobs);
    }

    /// <summary>
    /// Get a specific live job by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LiveJobDto>> GetById(int id)
    {
        var liveJob = await _liveJobService.GetByIdAsync(id);
        if (liveJob == null)
        {
            return NotFound(new { message = "Live job not found" });
        }

        return Ok(liveJob);
    }

    /// <summary>
    /// Start a live job.
    /// </summary>
    [HttpPut("{id}/start")]
    public async Task<ActionResult> StartJob(int id)
    {
        var success = await _liveJobService.StartJobAsync(id);
        if (!success)
        {
            return BadRequest(new { message = "Live job not found or not in NotStarted status" });
        }

        return Ok(new { message = "Live job started successfully" });
    }

    /// <summary>
    /// Complete a live job.
    /// </summary>
    [HttpPut("{id}/complete")]
    public async Task<ActionResult> CompleteJob(int id)
    {
        var success = await _liveJobService.CompleteJobAsync(id);
        if (!success)
        {
            return BadRequest(new { message = "Live job not found or not in InProgress/OnBreak status" });
        }

        return Ok(new { message = "Live job completed successfully" });
    }
}
