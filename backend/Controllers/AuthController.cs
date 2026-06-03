namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.DTOs.Auth;
using System.Security.Claims;

/// <summary>
/// Controller for authentication operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Login with email and password.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var result = await _authService.LoginAsync(request.Email, request.Password);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Refresh authentication token.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Refresh([FromBody] string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(new { message = "Refresh token is required" });
        }

        var result = await _authService.RefreshTokenAsync(refreshToken);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get current authenticated user information.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<LoginResponseDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        try
        {
            var result = await _authService.GetCurrentUserAsync(userId);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return NotFound(new { message = "User not found" });
        }
    }
}
