namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Customer;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using Google.Apis.Auth;
using Happy2CleanAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expirationHours;

    public CustomerController(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _secretKey = _configuration.GetValue<string>("JwtSettings:SecretKey") ?? "DefaultSecretKey";
        _issuer = _configuration.GetValue<string>("JwtSettings:Issuer") ?? "Happy2CleanAPI";
        _audience = _configuration.GetValue<string>("JwtSettings:Audience") ?? "Happy2CleanCustomer";
        _expirationHours = _configuration.GetValue<int>("JwtSettings:ExpirationHours", 24);
    }

    [HttpPost("send-verification")]
    [AllowAnonymous]
    public async Task<ActionResult> SendVerification([FromBody] SendVerificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required" });

        // Check email not already registered
        var existing = await _context.Customers.FirstOrDefaultAsync(c => c.Email == dto.Email);
        if (existing != null)
            return Conflict(new { message = "An account with this email already exists" });

        // Rate-limit: max 1 code per minute per email
        var recentCode = await _context.EmailVerifications
            .Where(v => v.Email == dto.Email && !v.IsUsed && v.CreatedAt > DateTime.UtcNow.AddMinutes(-1))
            .FirstOrDefaultAsync();
        if (recentCode != null)
            return BadRequest(new { message = "Please wait a minute before requesting another code" });

        // Generate 6-digit code
        var code = new Random().Next(100000, 999999).ToString();

        // Invalidate any previous unused codes for this email
        var oldCodes = await _context.EmailVerifications
            .Where(v => v.Email == dto.Email && !v.IsUsed)
            .ToListAsync();
        _context.EmailVerifications.RemoveRange(oldCodes);

        // Save new code
        _context.EmailVerifications.Add(new Happy2CleanAPI.Models.EmailVerification
        {
            Email     = dto.Email,
            Code      = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed    = false,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        // Send email
        try
        {
            await _emailService.SendVerificationCodeAsync(dto.Email, dto.FullName, code);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to send verification email: {ex.Message}" });
        }

        return Ok(new { message = "Verification code sent to your email" });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerTokenDto>> Register([FromBody] CustomerRegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required" });

        // Validate verification code
        var verification = await _context.EmailVerifications
            .Where(v => v.Email == dto.Email && v.Code == dto.VerificationCode && !v.IsUsed)
            .FirstOrDefaultAsync();

        if (verification == null)
            return BadRequest(new { message = "Invalid verification code" });

        if (verification.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Verification code has expired. Please request a new one." });

        var existing = await _context.Customers.FirstOrDefaultAsync(c => c.Email == dto.Email);
        if (existing != null)
            return Conflict(new { message = "An account with this email already exists" });

        var customer = new Customer
        {
            FullName     = dto.FullName,
            Email        = dto.Email,
            Phone        = dto.Phone,
            Address      = dto.Address,
            PasswordHash = BCrypt.HashPassword(dto.Password),
            CreatedAt    = DateTime.UtcNow
        };

        _context.Customers.Add(customer);

        // Mark code as used
        verification.IsUsed = true;

        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(customer.Id, customer.Email, customer.FullName);
        return Ok(new CustomerTokenDto(
            Token:      token,
            FullName:   customer.FullName,
            Email:      customer.Email,
            CustomerId: customer.Id
        ));
    }

    [HttpPost("google-login")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerTokenDto>> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _configuration.GetValue<string>("Google:ClientId") ?? "" }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
        }
        catch
        {
            return Unauthorized(new { message = "Invalid Google token" });
        }

        // Find or create the customer
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == payload.Email);
        if (customer == null)
        {
            customer = new Customer
            {
                FullName   = payload.Name ?? payload.Email,
                Email      = payload.Email,
                Phone      = "",
                Address    = "",
                PasswordHash = "", // No password for Google-auth users
                CreatedAt  = DateTime.UtcNow
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        var token = GenerateJwtToken(customer.Id, customer.Email, customer.FullName);
        return Ok(new CustomerTokenDto(
            Token:      token,
            FullName:   customer.FullName,
            Email:      customer.Email,
            CustomerId: customer.Id
        ));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerTokenDto>> Login([FromBody] CustomerLoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required" });

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (customer == null || string.IsNullOrEmpty(customer.PasswordHash) || !BCrypt.Verify(dto.Password, customer.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var token = GenerateJwtToken(customer.Id, customer.Email, customer.FullName);

        return Ok(new CustomerTokenDto(
            Token: token,
            FullName: customer.FullName,
            Email: customer.Email,
            CustomerId: customer.Id
        ));
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile()
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null)
            return Unauthorized(new { message = "Customer ID not found in token" });

        var customer = await _context.Customers.FindAsync(customerId.Value);
        if (customer == null)
            return NotFound(new { message = "Customer not found" });

        return Ok(new CustomerProfileDto(
            Id: customer.Id,
            FullName: customer.FullName,
            Email: customer.Email,
            Phone: customer.Phone,
            Address: customer.Address,
            CreatedAt: customer.CreatedAt
        ));
    }

    [HttpGet("bookings")]
    [Authorize]
    public async Task<ActionResult> GetBookings()
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null)
            return Unauthorized(new { message = "Customer ID not found in token" });

        var bookings = await _context.Bookings
            .Where(b => b.CustomerId == customerId.Value)
            .Include(b => b.Worker)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                b.ServiceType,
                b.Address,
                b.ScheduledAt,
                b.DurationMinutes,
                b.Status,
                b.Price,
                b.Notes,
                b.CreatedAt,
                Worker = b.Worker == null ? null : new
                {
                    b.Worker.Id,
                    b.Worker.FullName,
                    b.Worker.Phone
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("bookings/{id}")]
    [Authorize]
    public async Task<ActionResult> GetBookingById(int id)
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null)
            return Unauthorized(new { message = "Customer ID not found in token" });

        var booking = await _context.Bookings
            .Where(b => b.Id == id && b.CustomerId == customerId.Value)
            .Include(b => b.Worker)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                b.ServiceType,
                b.Address,
                b.ScheduledAt,
                b.DurationMinutes,
                b.Status,
                b.Price,
                b.Notes,
                b.CreatedAt,
                b.PaymentStatus,
                b.CustomerRating,
                b.CustomerReview,
                b.ReviewedAt,
                Worker = b.Worker == null ? null : new
                {
                    b.Worker.Id,
                    b.Worker.FullName,
                    b.Worker.Initials,
                    b.Worker.Phone,
                    b.Worker.Rating,
                    b.Worker.CompletedJobs,
                    b.Worker.ServiceType
                }
            })
            .FirstOrDefaultAsync();

        if (booking == null)
            return NotFound(new { message = "Booking not found" });

        return Ok(booking);
    }

    [HttpPost("bookings")]
    [Authorize]
    public async Task<ActionResult> CreateBooking([FromBody] CreateCustomerBookingDto dto)
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null)
            return Unauthorized(new { message = "Customer ID not found in token" });

        var customer = await _context.Customers.FindAsync(customerId.Value);
        if (customer == null)
            return NotFound(new { message = "Customer not found" });

        if (!Enum.TryParse<ServiceType>(dto.ServiceType, true, out var serviceType))
            return BadRequest(new { message = $"Invalid service type. Valid values: StandardClean, DeepClean, MoveInOut, PostConstruction" });

        var rng = new Random();
        var bookingNumber = "BK-" + rng.Next(1000, 9999).ToString();

        var booking = new Booking
        {
            BookingNumber = bookingNumber,
            CustomerId = customerId.Value,
            WorkerId = null,
            ServiceType = serviceType,
            Address = dto.Address,
            ScheduledAt = dto.ScheduledAt,
            DurationMinutes = dto.DurationMinutes,
            Price = dto.Price,
            Notes = dto.Notes,
            Status = BookingStatus.Scheduled,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBookings), new { }, new
        {
            booking.Id,
            booking.BookingNumber,
            booking.ServiceType,
            booking.Address,
            booking.ScheduledAt,
            booking.DurationMinutes,
            booking.Status,
            booking.Price,
            booking.Notes,
            booking.CreatedAt
        });
    }

    [HttpPost("bookings/{id}/review")]
    [Authorize]
    public async Task<ActionResult> SubmitReview(int id, [FromBody] SubmitReviewDto dto)
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null) return Unauthorized();

        var booking = await _context.Bookings
            .Include(b => b.Worker)
            .FirstOrDefaultAsync(b => b.Id == id && b.CustomerId == customerId.Value);

        if (booking == null) return NotFound(new { message = "Booking not found" });
        if (booking.Status != BookingStatus.Completed)
            return BadRequest(new { message = "Can only review completed bookings" });

        booking.CustomerRating = dto.Rating;
        booking.CustomerReview = dto.Review;
        booking.ReviewedAt     = DateTime.UtcNow;

        // Recalculate worker's average rating
        if (booking.Worker != null && dto.Rating > 0)
        {
            var otherRatings = await _context.Bookings
                .Where(b => b.WorkerId == booking.WorkerId && b.CustomerRating.HasValue && b.Id != id)
                .Select(b => b.CustomerRating!.Value)
                .ToListAsync();

            var allRatings = otherRatings.Append(dto.Rating).ToList();
            booking.Worker.Rating        = allRatings.Average();
            booking.Worker.CompletedJobs = allRatings.Count;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Review submitted. Thank you!" });
    }

    [HttpGet("bookings/{id}/receipt")]
    [Authorize]
    public async Task<ActionResult> GetReceipt(int id)
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == null) return Unauthorized();

        var booking = await _context.Bookings
            .Include(b => b.Worker)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id && b.CustomerId == customerId.Value);

        if (booking == null) return NotFound();

        return Ok(new
        {
            InvoiceNumber   = $"INV-{booking.BookingNumber}",
            booking.BookingNumber,
            CustomerName    = booking.Customer.FullName,
            CustomerEmail   = booking.Customer.Email,
            ServiceType     = booking.ServiceType.ToString(),
            booking.Address,
            booking.ScheduledAt,
            booking.DurationMinutes,
            booking.Price,
            booking.Status,
            booking.PaymentStatus,
            WorkerName      = booking.Worker?.FullName,
            booking.CustomerRating,
            booking.CustomerReview,
            PlatformFee     = 5m,
            booking.CreatedAt,
        });
    }

    private string GenerateJwtToken(int customerId, string email, string fullName)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customerId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, fullName),
            new Claim(ClaimTypes.Role, "customer"),
            new Claim("customerId", customerId.ToString())
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

    private int? GetCustomerIdFromToken()
    {
        var customerIdClaim = User.FindFirst("customerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (customerIdClaim == null || !int.TryParse(customerIdClaim.Value, out int id))
            return null;
        return id;
    }
}

public record CreateCustomerBookingDto(
    string ServiceType,
    string Address,
    DateTime ScheduledAt,
    int DurationMinutes,
    decimal Price,
    string? Notes,
    double? Latitude,
    double? Longitude
);

public record SubmitReviewDto(int Rating, string? Review, string[]? Tags);
