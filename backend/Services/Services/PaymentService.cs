using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Payment;
using Stripe;

namespace Happy2CleanAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public PaymentService(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
        StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
    }

    // ── Get saved card ────────────────────────────────────────
    public async Task<SavedCardDto> GetSavedCardAsync(int customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null || string.IsNullOrEmpty(customer.StripePaymentMethodId))
            return new SavedCardDto { HasCard = false };

        return new SavedCardDto
        {
            HasCard           = true,
            Last4             = customer.CardLast4,
            Brand             = customer.CardBrand,
            ExpMonth          = customer.CardExpMonth,
            ExpYear           = customer.CardExpYear,
            PaymentMethodId   = customer.StripePaymentMethodId,
        };
    }

    // ── Create SetupIntent to save a new card ─────────────────
    public async Task<SetupIntentResponseDto> CreateSetupIntentAsync(int customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId)
            ?? throw new InvalidOperationException("Customer not found.");

        // Ensure Stripe customer exists
        var stripeCustomerId = await EnsureStripeCustomerAsync(customer);

        var options = new SetupIntentCreateOptions
        {
            Customer = stripeCustomerId,
            AutomaticPaymentMethods = new SetupIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
                AllowRedirects = "never",
            },
        };

        var service = new SetupIntentService();
        var intent  = await service.CreateAsync(options);

        return new SetupIntentResponseDto
        {
            ClientSecret   = intent.ClientSecret,
            PublishableKey = _config["Stripe:PublishableKey"] ?? string.Empty,
        };
    }

    // ── Save the card after SetupIntent confirms ──────────────
    public async Task<SavedCardDto> SaveCardAsync(int customerId, string paymentMethodId)
    {
        var customer = await _context.Customers.FindAsync(customerId)
            ?? throw new InvalidOperationException("Customer not found.");

        var stripeCustomerId = await EnsureStripeCustomerAsync(customer);

        // Attach payment method to Stripe customer
        var attachSvc = new PaymentMethodService();
        var pm = await attachSvc.AttachAsync(paymentMethodId, new PaymentMethodAttachOptions
        {
            Customer = stripeCustomerId,
        });

        // Set as default payment method on the Stripe customer
        var customerUpdateSvc = new CustomerService();
        await customerUpdateSvc.UpdateAsync(stripeCustomerId, new CustomerUpdateOptions
        {
            InvoiceSettings = new CustomerInvoiceSettingsOptions
            {
                DefaultPaymentMethod = paymentMethodId,
            },
        });

        // Persist card details
        customer.StripePaymentMethodId = paymentMethodId;
        customer.CardLast4    = pm.Card?.Last4;
        customer.CardBrand    = pm.Card?.Brand;
        customer.CardExpMonth = (int?)pm.Card?.ExpMonth;
        customer.CardExpYear  = (int?)pm.Card?.ExpYear;
        await _context.SaveChangesAsync();

        return new SavedCardDto
        {
            HasCard         = true,
            Last4           = customer.CardLast4,
            Brand           = customer.CardBrand,
            ExpMonth        = customer.CardExpMonth,
            ExpYear         = customer.CardExpYear,
            PaymentMethodId = paymentMethodId,
        };
    }

    // ── Create PaymentIntent ──────────────────────────────────
    public async Task<PaymentIntentResponseDto> CreatePaymentIntentAsync(int customerId, CreatePaymentIntentDto dto)
    {
        var customer = await _context.Customers.FindAsync(customerId)
            ?? throw new InvalidOperationException("Customer not found.");

        var stripeCustomerId = await EnsureStripeCustomerAsync(customer);

        var options = new PaymentIntentCreateOptions
        {
            Amount   = (long)(dto.Amount * 100),
            Currency = dto.Currency,
            Customer = stripeCustomerId,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled        = true,
                AllowRedirects = "never",
            },
            Metadata = new Dictionary<string, string>
            {
                { "customerId", customerId.ToString() },
            },
        };

        // Attach saved payment method if one exists
        if (!string.IsNullOrEmpty(customer.StripePaymentMethodId))
            options.PaymentMethod = customer.StripePaymentMethodId;

        var service = new PaymentIntentService();
        var intent  = await service.CreateAsync(options);

        return new PaymentIntentResponseDto
        {
            ClientSecret    = intent.ClientSecret,
            PaymentIntentId = intent.Id,
            AmountCents     = intent.Amount,
            PublishableKey  = _config["Stripe:PublishableKey"] ?? string.Empty,
        };
    }

    // ── Confirm payment in DB ─────────────────────────────────
    public async Task<bool> ConfirmPaymentAsync(ConfirmPaymentDto dto)
    {
        var booking = await _context.Bookings.FindAsync(dto.BookingId);
        if (booking is null) return false;

        booking.PaymentIntentId = dto.PaymentIntentId;
        booking.PaymentStatus   = "paid";
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Helper: ensure Stripe customer record ─────────────────
    private async Task<string> EnsureStripeCustomerAsync(Models.Customer customer)
    {
        if (!string.IsNullOrEmpty(customer.StripeCustomerId))
            return customer.StripeCustomerId;

        var svc = new CustomerService();
        var stripeCustomer = await svc.CreateAsync(new CustomerCreateOptions
        {
            Email = customer.Email,
            Name  = customer.FullName,
            Metadata = new Dictionary<string, string>
            {
                { "customerId", customer.Id.ToString() },
            },
        });

        customer.StripeCustomerId = stripeCustomer.Id;
        await _context.SaveChangesAsync();
        return stripeCustomer.Id;
    }
}
