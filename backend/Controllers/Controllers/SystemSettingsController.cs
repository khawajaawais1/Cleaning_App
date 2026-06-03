namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Settings;

[ApiController]
[Route("api/settings")]
public class SystemSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SystemSettingsController(ApplicationDbContext db) => _db = db;

    /// <summary>Public endpoint — worker portal reads this on startup to know if it's live.</summary>
    [HttpGet("worker-portal")]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var settings = await GetOrCreate();
        return Ok(Map(settings));
    }

    /// <summary>Admin-only: toggle the worker portal on or off.</summary>
    [HttpPatch("worker-portal")]
    [Authorize]
    public async Task<IActionResult> Toggle([FromBody] ToggleWorkerPortalDto dto)
    {
        var settings = await GetOrCreate();

        var wasEnabled = settings.WorkerPortalEnabled;
        settings.WorkerPortalEnabled = dto.Enabled;
        settings.UpdatedAt = DateTime.UtcNow;

        if (dto.Enabled && !wasEnabled)
        {
            settings.WorkerPortalEnabledAt = DateTime.UtcNow;
            settings.WorkerPortalDisabledReason = null;
        }
        else if (!dto.Enabled && wasEnabled)
        {
            settings.WorkerPortalDisabledAt = DateTime.UtcNow;
            settings.WorkerPortalDisabledReason = dto.Reason;
        }

        await _db.SaveChangesAsync();
        return Ok(Map(settings));
    }

    /// <summary>Public — customer portal reads platform fee for price calculation.</summary>
    [HttpGet("platform-fee")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlatformFee()
    {
        var s = await GetOrCreate();
        return Ok(new PlatformFeeDto(s.PlatformFee, s.PlatformFeeType));
    }

    /// <summary>Admin-only: update platform fee.</summary>
    [HttpPatch("platform-fee")]
    [Authorize]
    public async Task<IActionResult> UpdatePlatformFee([FromBody] PlatformFeeDto dto)
    {
        if (dto.Fee < 0) return BadRequest(new { message = "Fee cannot be negative." });
        if (dto.FeeType != "flat" && dto.FeeType != "percent")
            return BadRequest(new { message = "FeeType must be 'flat' or 'percent'." });
        if (dto.FeeType == "percent" && dto.Fee > 100)
            return BadRequest(new { message = "Percentage fee cannot exceed 100." });

        var s = await GetOrCreate();
        s.PlatformFee     = dto.Fee;
        s.PlatformFeeType = dto.FeeType;
        s.UpdatedAt       = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new PlatformFeeDto(s.PlatformFee, s.PlatformFeeType));
    }

    private async Task<Models.SystemSettings> GetOrCreate()
    {
        var settings = await _db.SystemSettings.FindAsync(1);
        if (settings == null)
        {
            settings = new Models.SystemSettings { Id = 1 };
            _db.SystemSettings.Add(settings);
            await _db.SaveChangesAsync();
        }
        return settings;
    }

    private static SystemSettingsDto Map(Models.SystemSettings s) => new(
        s.WorkerPortalEnabled,
        s.WorkerPortalEnabledAt,
        s.WorkerPortalDisabledAt,
        s.WorkerPortalDisabledReason,
        s.PlatformFee,
        s.PlatformFeeType,
        s.UpdatedAt
    );
}
