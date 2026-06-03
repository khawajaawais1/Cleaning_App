namespace Happy2CleanAPI.Data;

using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Models;

/// <summary>
/// Entity Framework Core DbContext for Happy2Clean application.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Worker> Workers { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<LiveJob> LiveJobs { get; set; } = null!;
    public DbSet<ExtensionRequest> ExtensionRequests { get; set; } = null!;
    public DbSet<WorkerDocument> WorkerDocuments { get; set; } = null!;
    public DbSet<SystemSettings> SystemSettings { get; set; } = null!;
    public DbSet<ServiceRate> ServiceRates { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Worker configuration
        modelBuilder.Entity<Worker>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Initials).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasConversion<string>();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BookingNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasConversion<string>();
            entity.Property(e => e.ServiceType).IsRequired().HasConversion<string>();
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.HasIndex(e => e.BookingNumber).IsUnique();
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Worker)
                .WithMany(w => w.Bookings)
                .HasForeignKey(e => e.WorkerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // LiveJob configuration
        modelBuilder.Entity<LiveJob>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasConversion<string>();
            entity.HasOne(e => e.Booking)
                .WithOne(b => b.LiveJob)
                .HasForeignKey<LiveJob>(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ExtensionRequest configuration
        modelBuilder.Entity<ExtensionRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasConversion<string>();
            entity.Property(e => e.WorkerReason).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.LiveJob)
                .WithMany(lj => lj.ExtensionRequests)
                .HasForeignKey(e => e.LiveJobId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // SystemSettings — always one row, seeded on first access
        modelBuilder.Entity<SystemSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WorkerPortalDisabledReason).HasMaxLength(500);
            entity.Property(e => e.PlatformFeeType).HasMaxLength(10);
            entity.Property(e => e.PlatformFee).HasPrecision(10, 2);
            entity.HasData(new SystemSettings
            {
                Id = 1,
                WorkerPortalEnabled = false,
                PlatformFee = 5m,
                PlatformFeeType = "flat",
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        });

        // ServiceRates — seeded with current hardcoded values from customer portal
        modelBuilder.Entity<ServiceRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Tagline).HasMaxLength(200);
            entity.Property(e => e.Icon).HasMaxLength(10);
            entity.Property(e => e.RatePerHour).HasPrecision(10, 2);
            entity.HasIndex(e => e.ServiceType).IsUnique();
            entity.HasData(
                new ServiceRate { Id = 1, ServiceType = "StandardClean", Label = "Standard clean",  Tagline = "Regular tidy — surfaces, floors, bathrooms",      Icon = "🧹", RatePerHour = 25m, IsActive = true, DisplayOrder = 1, UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new ServiceRate { Id = 2, ServiceType = "DeepClean",     Label = "Deep clean",      Tagline = "Top to bottom — inside appliances, every corner",  Icon = "✨", RatePerHour = 35m, IsActive = true, DisplayOrder = 2, UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new ServiceRate { Id = 3, ServiceType = "OfficeClean",   Label = "Office clean",    Tagline = "Commercial spaces and shared areas",               Icon = "🏢", RatePerHour = 30m, IsActive = true, DisplayOrder = 3, UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new ServiceRate { Id = 4, ServiceType = "MoveInOut",     Label = "Move-out clean",  Tagline = "End of tenancy — deposit-back standard",           Icon = "📦", RatePerHour = 30m, IsActive = true, DisplayOrder = 4, UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        });

        // WorkerDocument configuration
        modelBuilder.Entity<WorkerDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.BlobUrl).HasMaxLength(1000);
            entity.Property(e => e.BlobName).HasMaxLength(500);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.HasOne(e => e.Worker)
                .WithMany(w => w.Documents)
                .HasForeignKey(e => e.WorkerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
