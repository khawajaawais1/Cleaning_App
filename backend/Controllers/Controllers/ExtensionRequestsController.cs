namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.ExtensionRequest;

/// <summary>
/// Controller for extension request management operations.
/// </summary>
[ApiController]
[Route("api/extension-requests")]
[Authorize]
public class ExtensionRequestsController : ControllerBase
{
    private readonly IExtensionRequestService _extensionRequestService;

    public ExtensionRequestsController(IExtensionRequestService extensionRequestService)
    {
        _extensionRequestService = extensionRequestService;
    }

    /// <summary>
    /// Get all extension requests with optional status filter.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ExtensionRequestDto>>> GetAll([FromQuery] string? status = null)
    {
        var requests = await _extensionRequestService.GetAllAsync(status);
        return Ok(requests);
    }

    /// <summary>
    /// Get a specific extension request by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ExtensionRequestDto>> GetById(int id)
    {
        var request = await _extensionRequestService.GetByIdAsync(id);
        if (request == null)
        {
            return NotFound(new { message = "Extension request not found" });
        }

        return Ok(request);
    }

    /// <summary>
    /// Approve an extension request.
    /// </summary>
    [HttpPut("{id}/approve")]
    public async Task<ActionResult> Approve(int id, [FromBody] ExtensionDecisionDto? request = null)
    {
        var success = await _extensionRequestService.ApproveAsync(id, request?.AdminNote);
        if (!success)
        {
            return BadRequest(new { message = "Extension request not found or not in pending status" });
        }

        return Ok(new { message = "Extension request approved successfully" });
    }

    /// <summary>
    /// Deny an extension request.
    /// </summary>
    [HttpPut("{id}/deny")]
    public async Task<ActionResult> Deny(int id, [FromBody] ExtensionDecisionDto? request = null)
    {
        var success = await _extensionRequestService.DenyAsync(id, request?.AdminNote);
        if (!success)
        {
            return BadRequest(new { message = "Extension request not found or not in pending status" });
        }

        return Ok(new { message = "Extension request denied successfully" });
    }

    /// <summary>
    /// Ask worker for confirmation on extension request.
    /// </summary>
    [HttpPut("{id}/ask-worker")]
    public async Task<ActionResult> AskWorker(int id, [FromBody] ExtensionDecisionDto? request = null)
    {
        var success = await _extensionRequestService.AskWorkerAsync(id, request?.AdminNote);
        if (!success)
        {
            return BadRequest(new { message = "Extension request not found or not in pending status" });
        }

        return Ok(new { message = "Worker asked for confirmation" });
    }
}
