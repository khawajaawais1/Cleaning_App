namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

/// <summary>
/// Service for authentication operations.
/// </summary>
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly int _expirationHours;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        _expirationHours = _configuration.GetValue<int>("JwtSettings:ExpirationHours", 24);
        _secretKey = _configuration.GetValue<string>("JwtSettings:SecretKey") ?? "DefaultSecretKey";
        _issuer = _configuration.GetValue<string>("JwtSettings:Issuer") ?? "Happy2CleanAPI";
        _audience = _configuration.GetValue<string>("JwtSettings:Audience") ?? "Happy2CleanAdmin";
    }

    public async Task<LoginResponseDto?> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Verify(password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user.Id, user.Email, user.FullName, user.Role);
        var nameParts = user.FullName.Split(' ', 2);

        return new LoginResponseDto(
            User: new UserDto(
                Id: user.Id.ToString(),
                Email: user.Email,
                FirstName: nameParts.Length > 0 ? nameParts[0] : user.FullName,
                LastName: nameParts.Length > 1 ? nameParts[1] : "",
                Role: user.Role.ToLower()
            ),
            Token: token,
            ExpiresIn: _expirationHours * 3600
        );
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        var principal = GetPrincipalFromExpiredToken(refreshToken);
        if (principal == null) return null;

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return null;

        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return null;

        var token = GenerateJwtToken(user.Id, user.Email, user.FullName, user.Role);
        var nameParts = user.FullName.Split(' ', 2);

        return new LoginResponseDto(
            User: new UserDto(
                Id: user.Id.ToString(),
                Email: user.Email,
                FirstName: nameParts.Length > 0 ? nameParts[0] : user.FullName,
                LastName: nameParts.Length > 1 ? nameParts[1] : "",
                Role: user.Role.ToLower()
            ),
            Token: token,
            ExpiresIn: _expirationHours * 3600
        );
    }

    public async Task<LoginResponseDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        var token = GenerateJwtToken(user.Id, user.Email, user.FullName, user.Role);
        var nameParts = user.FullName.Split(' ', 2);

        return new LoginResponseDto(
            User: new UserDto(
                Id: user.Id.ToString(),
                Email: user.Email,
                FirstName: nameParts.Length > 0 ? nameParts[0] : user.FullName,
                LastName: nameParts.Length > 1 ? nameParts[1] : "",
                Role: user.Role.ToLower()
            ),
            Token: token,
            ExpiresIn: _expirationHours * 3600
        );
    }

    private string GenerateJwtToken(int userId, string email, string fullName, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, fullName),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token,
                new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateLifetime = false,
                    ValidIssuer = _issuer,
                    ValidAudience = _audience
                },
                out _);
            return principal;
        }
        catch { return null; }
    }
}
