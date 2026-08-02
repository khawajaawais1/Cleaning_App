using Happy2CleanAPI.Data;
using Happy2CleanAPI.Services;
using Happy2CleanAPI.Middleware;
using Happy2CleanAPI.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IWorkerService, WorkerService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ILiveJobService, LiveJobService>();
builder.Services.AddScoped<IExtensionRequestService, ExtensionRequestService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Worker portal infrastructure
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddSingleton<ILocationPublisher, ServiceBusLocationPublisher>();

// Add JWT authentication — accepts tokens for Admin, Worker and Customer portals
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("SecretKey") ?? "DefaultSecretKey";
var issuer = jwtSettings.GetValue<string>("Issuer") ?? "Happy2CleanAPI";
var validAudiences = jwtSettings.GetSection("Audiences").Get<string[]>()
    ?? new[] { "Happy2CleanAdmin", "Happy2CleanWorker", "Happy2CleanCustomer" };

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudiences = validAudiences,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.Host == "localhost"
                    || uri.Host == "127.0.0.1"
                    || uri.Host == "::1";
            })
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Happy2Clean API",
        Version = "v1",
        Description = "API for Happy2Clean - Cleaning Service Management Platform"
    });

    // Add JWT bearer to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

//// Apply migrations and seed data
//using (var scope = app.Services.CreateScope())
//{
//    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

//    // Drop and recreate so seeded DateTime.UtcNow values stay current on each restart.
//    // Remove EnsureDeleted() once you have real production data.
//    dbContext.Database.EnsureDeleted();
//    dbContext.Database.EnsureCreated();
//    await DataSeeder.SeedAsync(dbContext);
//}

// Configure the HTTP request pipeline
var swaggerEnabled = app.Configuration.GetValue("Swagger:Enabled", app.Environment.IsDevelopment());
if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Happy2Clean API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();

// Add exception middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
