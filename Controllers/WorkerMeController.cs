namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Worker;
using System.Security.Claims;

[ApiController]
[Route("api/worker/me")]
[Authorize(Roles = "Worker")]
public class WorkerMeController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public WorkerMeController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var worker = await _db.Workers.FindAsync(GetWorkerId());
        if (worker == null) return NotFound();

        var parts = worker.FullName.Split(' ', 2);
        return Ok(new WorkerProfileDto(
            Id: worker.Id,
            FirstName: parts[0],
            LastName: parts.Length > 1 ? parts[1] : "",
            Email: worker.Email,
            Phone: worker.Phone,
            City: worker.City,
            ServiceType: worker.ServiceType,
            Status: worker.Status.ToString().ToLower(),
            Rating: worker.Rating,
            CompletedJobs: worker.CompletedJobs,
            IsOnline: worker.IsOnline,
            Initials: worker.Initials,
            JoinedDate: worker.AppliedAt,
            ApprovedDate: worker.ApprovedAt
        ));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateWorkerProfileDto dto)
    {
        var worker = await _db.Workers.FindAsync(GetWorkerId());
        if (worker == null) return NotFound();

        if (dto.Phone != null) worker.Phone = dto.Phone;
        if (dto.City != null) worker.City = dto.City;
        if (dto.ServiceType != null) worker.ServiceType = dto.ServiceType;
        if (dto.IsOnline.HasValue) worker.IsOnline = dto.IsOnline.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("online")]
    public async Task<IActionResult> ToggleOnline([FromBody] ToggleOnlineDto dto)
    {
        var worker = await _db.Workers.FindAsync(GetWorkerId());
        if (worker == null) return NotFound();
        worker.IsOnline = dto.IsOnline;
        await _db.SaveChangesAsync();
        return Ok(new { isOnline = worker.IsOnline });
    }

    private int GetWorkerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

public record ToggleOnlineDto(bool IsOnline);
