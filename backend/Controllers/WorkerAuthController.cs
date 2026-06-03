namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Worker;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

[ApiController]
[Route("api/worker/auth")]
public class WorkerAuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public WorkerAuthController(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] WorkerLoginDto dto)
    {
        var settings = await _db.SystemSettings.FindAsync(1);
        if (settings is { WorkerPortalEnabled: false })
            return StatusCode(503, new
            {
                code = "PORTAL_DISABLED",
                message = "The Worker Portal is not yet active. Jobs are currently managed directly by the admin. You will be notified when the portal goes live."
            });

        var worker = await _db.Workers.FirstOrDefaultAsync(w => w.Email == dto.Email);
        if (worker == null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (worker.PasswordHash != null && !BCrypt.Verify(dto.Password, worker.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (worker.Status == WorkerStatus.Pending)
            return Unauthorized(new { message = "Your application is pending admin approval." });

        if (worker.Status == WorkerStatus.Rejected)
            return Unauthorized(new { message = "Your application has been rejected." });

        if (worker.Status == WorkerStatus.Suspended)
            return Unauthorized(new { message = "Your account has been suspended. Please contact support." });

        var token = GenerateToken(worker);
        return Ok(new WorkerAuthResponseDto(MapProfile(worker), token, 24 * 3600));
    }

    [HttpPost("signup")]
    [AllowAnonymous]
    public async Task<IActionResult> Signup([FromBody] WorkerSignupDto dto)
    {
        if (await _db.Workers.AnyAsync(w => w.Email == dto.Email))
            return Conflict(new { message = "An account with this email already exists." });

        var fullName = $"{dto.FirstName} {dto.LastName}".Trim();
        var initials = $"{dto.FirstName[0]}{dto.LastName[0]}".ToUpper();

        var worker = new Worker
        {
            FullName = fullName,
            Initials = initials,
            Email = dto.Email,
            Phone = dto.Phone,
            City = dto.City,
            ServiceType = dto.ServiceType,
            PasswordHash = BCrypt.HashPassword(dto.Password),
            Status = WorkerStatus.Pending,
            AppliedAt = DateTime.UtcNow,
            Rating = 0,
            CompletedJobs = 0,
            IsOnline = false
        };

        _db.Workers.Add(worker);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Application submitted. You will be notified once reviewed by our team." });
    }

    [HttpGet("me")]
    [Authorize(Roles = "Worker")]
    public async Task<IActionResult> GetMe()
    {
        var workerId = GetWorkerId();
        var worker = await _db.Workers.FindAsync(workerId);
        if (worker == null) return NotFound();
        return Ok(MapProfile(worker));
    }

    private int GetWorkerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string GenerateToken(Worker worker)
    {
        var secretKey = _config.GetValue<string>("JwtSettings:SecretKey")!;
        var issuer = _config.GetValue<string>("JwtSettings:Issuer")!;
        var expHours = _config.GetValue<int>("JwtSettings:ExpirationHours", 24);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, worker.Id.ToString()),
            new Claim(ClaimTypes.Email, worker.Email),
            new Claim(ClaimTypes.Name, worker.FullName),
            new Claim(ClaimTypes.Role, "Worker"),
            new Claim("workerId", worker.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: "Happy2CleanWorker",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static WorkerProfileDto MapProfile(Worker w)
    {
        var parts = w.FullName.Split(' ', 2);
        return new WorkerProfileDto(
            Id: w.Id,
            FirstName: parts[0],
            LastName: parts.Length > 1 ? parts[1] : "",
            Email: w.Email,
            Phone: w.Phone,
            City: w.City,
            ServiceType: w.ServiceType,
            Status: w.Status.ToString().ToLower(),
            Rating: w.Rating,
            CompletedJobs: w.CompletedJobs,
            IsOnline: w.IsOnline,
            Initials: w.Initials,
            JoinedDate: w.AppliedAt,
            ApprovedDate: w.ApprovedAt
        );
    }
}
