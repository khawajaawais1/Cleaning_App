using Happy2CleanAPI.DTOs.Payment;
using Happy2CleanAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Happy2CleanAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>Get the current customer's saved card (if any).</summary>
    [HttpGet("card")]
    public async Task<ActionResult<SavedCardDto>> GetSavedCard()
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        var card = await _paymentService.GetSavedCardAsync(customerId.Value);
        return Ok(card);
    }

    /// <summary>Create a SetupIntent so the customer can save a new card.</summary>
    [HttpPost("setup-intent")]
    public async Task<ActionResult<SetupIntentResponseDto>> CreateSetupIntent()
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        try
        {
            var result = await _paymentService.CreateSetupIntentAsync(customerId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Attach a PaymentMethod to the customer and persist card details.</summary>
    [HttpPost("save-card")]
    public async Task<ActionResult<SavedCardDto>> SaveCard([FromBody] SaveCardDto dto)
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        try
        {
            var card = await _paymentService.SaveCardAsync(customerId.Value, dto.PaymentMethodId);
            return Ok(card);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Create a Stripe PaymentIntent for the current customer.</summary>
    [HttpPost("create-intent")]
    public async Task<ActionResult<PaymentIntentResponseDto>> CreateIntent([FromBody] CreatePaymentIntentDto dto)
    {
        if (dto.Amount <= 0) return BadRequest(new { message = "Amount must be greater than zero." });

        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        try
        {
            var result = await _paymentService.CreatePaymentIntentAsync(customerId.Value, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Mark a booking as paid after Stripe confirms the payment.</summary>
    [HttpPost("confirm")]
    public async Task<ActionResult> ConfirmPayment([FromBody] ConfirmPaymentDto dto)
    {
        var success = await _paymentService.ConfirmPaymentAsync(dto);
        if (!success) return NotFound(new { message = "Booking not found." });

        return Ok(new { message = "Payment confirmed and booking updated." });
    }

    private int? GetCustomerId()
    {
        var claim = User.FindFirst("customerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || !int.TryParse(claim.Value, out int id)) return null;
        return id;
    }
}
