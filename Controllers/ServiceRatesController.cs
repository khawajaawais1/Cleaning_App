namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Settings;

[ApiController]
[Route("api/service-rates")]
public class ServiceRatesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ServiceRatesController(ApplicationDbContext db) => _db = db;

    /// <summary>Public — customer portal reads this to get live rates.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var rates = await _db.ServiceRates
            .OrderBy(r => r.DisplayOrder)
            .ToListAsync();
        return Ok(rates.Select(Map));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var rate = await _db.ServiceRates.FindAsync(id);
        return rate == null ? NotFound() : Ok(Map(rate));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateServiceRateDto dto)
    {
        if (await _db.ServiceRates.AnyAsync(r => r.ServiceType == dto.ServiceType))
            return Conflict(new { message = $"A service with type '{dto.ServiceType}' already exists." });

        var rate = new ServiceRate
        {
            ServiceType  = dto.ServiceType,
            Label        = dto.Label,
            Tagline      = dto.Tagline,
            Icon         = dto.Icon,
            RatePerHour  = dto.RatePerHour,
            DisplayOrder = dto.DisplayOrder,
            IsActive     = true,
            UpdatedAt    = DateTime.UtcNow
        };

        _db.ServiceRates.Add(rate);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = rate.Id }, Map(rate));
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceRateDto dto)
    {
        var rate = await _db.ServiceRates.FindAsync(id);
        if (rate == null) return NotFound();

        if (dto.Label        != null) rate.Label        = dto.Label;
        if (dto.Tagline      != null) rate.Tagline      = dto.Tagline;
        if (dto.Icon         != null) rate.Icon         = dto.Icon;
        if (dto.RatePerHour  != null) rate.RatePerHour  = dto.RatePerHour.Value;
        if (dto.IsActive     != null) rate.IsActive     = dto.IsActive.Value;
        if (dto.DisplayOrder != null) rate.DisplayOrder = dto.DisplayOrder.Value;

        rate.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(Map(rate));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var rate = await _db.ServiceRates.FindAsync(id);
        if (rate == null) return NotFound();
        _db.ServiceRates.Remove(rate);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ServiceRateDto Map(ServiceRate r) => new(
        r.Id, r.ServiceType, r.Label, r.Tagline, r.Icon, r.RatePerHour, r.IsActive, r.DisplayOrder, r.UpdatedAt
    );
}
