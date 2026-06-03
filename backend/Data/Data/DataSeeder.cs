namespace Happy2CleanAPI.Data;

using Happy2CleanAPI.Models;
using BCrypt.Net;

/// <summary>
/// Seeder for initial database data (idempotent).
/// </summary>
public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        try
        {
            // Seed Users
            if (!context.Users.Any())
            {
                var adminPasswordHash = BCrypt.HashPassword("Admin123!");
                var adminUser = new User
                {
                    Email = "admin@happy2clean.com",
                    PasswordHash = adminPasswordHash,
                    FullName = "Admin User",
                    Role = "SuperAdmin",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }

            // Seed Customers
            if (!context.Customers.Any())
            {
                var demoPassword = BCrypt.HashPassword("demo1234");
                var customers = new List<Customer>
                {
                    new Customer
                    {
                        FullName = "John Smith",
                        Email = "john.smith@email.com",
                        Phone = "555-0101",
                        Address = "123 Main St, Springfield, IL 62701",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new Customer
                    {
                        FullName = "Sarah Johnson",
                        Email = "sarah.johnson@email.com",
                        Phone = "555-0102",
                        Address = "456 Oak Ave, Springfield, IL 62702",
                        CreatedAt = DateTime.UtcNow.AddDays(-25)
                    },
                    new Customer
                    {
                        FullName = "Michael Brown",
                        Email = "michael.brown@email.com",
                        Phone = "555-0103",
                        Address = "789 Pine Rd, Springfield, IL 62703",
                        CreatedAt = DateTime.UtcNow.AddDays(-20)
                    },
                    new Customer
                    {
                        FullName = "Emily Davis",
                        Email = "emily.davis@email.com",
                        Phone = "555-0104",
                        Address = "321 Elm St, Springfield, IL 62704",
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    },
                    new Customer
                    {
                        FullName = "David Wilson",
                        Email = "david.wilson@email.com",
                        Phone = "555-0105",
                        Address = "654 Maple Dr, Springfield, IL 62705",
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Customer
                    {
                        FullName = "Sarah Chen",
                        Email = "sarah@demo.com",
                        Phone = "+358 40 111 2233",
                        Address = "Mannerheimintie 5 A 12, Helsinki",
                        PasswordHash = demoPassword,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new Customer
                    {
                        FullName = "James Riley",
                        Email = "james@demo.com",
                        Phone = "+358 40 222 3344",
                        Address = "Fredrikinkatu 22 B 8, Helsinki",
                        PasswordHash = demoPassword,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    }
                };
                context.Customers.AddRange(customers);
                await context.SaveChangesAsync();
            }

            // Seed Workers
            if (!context.Workers.Any())
            {
                var workerPassword = BCrypt.HashPassword("worker123");
                var workers = new List<Worker>
                {
                    new Worker
                    {
                        FullName = "Maria Kovac",
                        Initials = "MK",
                        Email = "maria.kovac@worker.com",
                        Phone = "555-1001",
                        City = "Helsinki",
                        Status = WorkerStatus.Active,
                        ServiceType = "Deep Clean",
                        AppliedAt = DateTime.UtcNow.AddDays(-60),
                        ApprovedAt = DateTime.UtcNow.AddDays(-55),
                        Rating = 4.8,
                        CompletedJobs = 45,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    },
                    new Worker
                    {
                        FullName = "James Reyes",
                        Initials = "JR",
                        Email = "james.reyes@worker.com",
                        Phone = "555-1002",
                        City = "Espoo",
                        Status = WorkerStatus.Active,
                        ServiceType = "Standard Clean",
                        AppliedAt = DateTime.UtcNow.AddDays(-50),
                        ApprovedAt = DateTime.UtcNow.AddDays(-45),
                        Rating = 4.6,
                        CompletedJobs = 38,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    },
                    new Worker
                    {
                        FullName = "Priya Naidu",
                        Initials = "PN",
                        Email = "priya.naidu@worker.com",
                        Phone = "555-1003",
                        City = "Helsinki",
                        Status = WorkerStatus.Active,
                        ServiceType = "Deep Clean",
                        AppliedAt = DateTime.UtcNow.AddDays(-45),
                        ApprovedAt = DateTime.UtcNow.AddDays(-40),
                        Rating = 4.7,
                        CompletedJobs = 29,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    },
                    new Worker
                    {
                        FullName = "Samuel Okoro",
                        Initials = "SO",
                        Email = "samuel.okoro@worker.com",
                        Phone = "555-1004",
                        City = "Vantaa",
                        Status = WorkerStatus.Active,
                        ServiceType = "Move In/Out",
                        AppliedAt = DateTime.UtcNow.AddDays(-40),
                        ApprovedAt = DateTime.UtcNow.AddDays(-35),
                        Rating = 4.9,
                        CompletedJobs = 52,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    },
                    new Worker
                    {
                        FullName = "Anna Lindberg",
                        Initials = "AL",
                        Email = "anna.lindberg@worker.com",
                        Phone = "555-1005",
                        City = "Helsinki",
                        Status = WorkerStatus.Active,
                        ServiceType = "Post Construction",
                        AppliedAt = DateTime.UtcNow.AddDays(-35),
                        ApprovedAt = DateTime.UtcNow.AddDays(-30),
                        Rating = 4.5,
                        CompletedJobs = 33,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    },
                    new Worker
                    {
                        FullName = "Elena Virtanen",
                        Initials = "EV",
                        Email = "elena@cleanapp.com",
                        Phone = "555-1006",
                        City = "Turku",
                        Status = WorkerStatus.Active,
                        ServiceType = "Deep clean",
                        AppliedAt = DateTime.UtcNow.AddDays(-20),
                        ApprovedAt = DateTime.UtcNow.AddDays(-18),
                        Rating = 5.0,
                        CompletedJobs = 67,
                        IsOnline = true,
                        PasswordHash = workerPassword
                    }
                };
                context.Workers.AddRange(workers);
                await context.SaveChangesAsync();
            }

            // Seed Bookings
            if (!context.Bookings.Any())
            {
                var customers = context.Customers.ToList();
                var workers = context.Workers.Where(w => w.Status == WorkerStatus.Active).ToList();

                var bookings = new List<Booking>
                {
                    new Booking
                    {
                        BookingNumber = "BK-0001",
                        CustomerId = customers[0].Id,
                        WorkerId = workers[0].Id,
                        ServiceType = ServiceType.DeepClean,
                        Address = "123 Main St, Springfield, IL 62701",
                        ScheduledAt = DateTime.UtcNow.AddDays(1),
                        DurationMinutes = 180,
                        Status = BookingStatus.Scheduled,
                        Price = 350m,
                        Notes = "Full deep clean, including windows",
                        CreatedAt = DateTime.UtcNow.AddDays(-7)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0002",
                        CustomerId = customers[1].Id,
                        WorkerId = workers[1].Id,
                        ServiceType = ServiceType.StandardClean,
                        Address = "456 Oak Ave, Springfield, IL 62702",
                        ScheduledAt = DateTime.UtcNow.AddHours(-2),
                        DurationMinutes = 120,
                        Status = BookingStatus.InProgress,
                        Price = 180m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0003",
                        CustomerId = customers[2].Id,
                        WorkerId = workers[2].Id,
                        ServiceType = ServiceType.MoveInOut,
                        Address = "789 Pine Rd, Springfield, IL 62703",
                        ScheduledAt = DateTime.UtcNow.AddHours(-4),
                        DurationMinutes = 240,
                        Status = BookingStatus.InProgress,
                        Price = 520m,
                        Notes = "Move out cleaning - check all corners",
                        CreatedAt = DateTime.UtcNow.AddDays(-6)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0004",
                        CustomerId = customers[3].Id,
                        WorkerId = null,
                        ServiceType = ServiceType.StandardClean,
                        Address = "321 Elm St, Springfield, IL 62704",
                        ScheduledAt = DateTime.UtcNow.AddDays(5),
                        DurationMinutes = 120,
                        Status = BookingStatus.Scheduled,
                        Price = 180m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0005",
                        CustomerId = customers[4].Id,
                        WorkerId = workers[0].Id,
                        ServiceType = ServiceType.DeepClean,
                        Address = "654 Maple Dr, Springfield, IL 62705",
                        ScheduledAt = DateTime.UtcNow.AddDays(-1),
                        DurationMinutes = 180,
                        Status = BookingStatus.Completed,
                        Price = 350m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0006",
                        CustomerId = customers[0].Id,
                        WorkerId = workers[1].Id,
                        ServiceType = ServiceType.StandardClean,
                        Address = "123 Main St, Springfield, IL 62701",
                        ScheduledAt = DateTime.UtcNow.AddDays(3),
                        DurationMinutes = 120,
                        Status = BookingStatus.Scheduled,
                        Price = 180m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0007",
                        CustomerId = customers[1].Id,
                        WorkerId = workers[2].Id,
                        ServiceType = ServiceType.PostConstruction,
                        Address = "456 Oak Ave, Springfield, IL 62702",
                        ScheduledAt = DateTime.UtcNow.AddDays(2),
                        DurationMinutes = 360,
                        Status = BookingStatus.Scheduled,
                        Price = 750m,
                        Notes = "New construction cleanup",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0008",
                        CustomerId = customers[2].Id,
                        WorkerId = workers[0].Id,
                        ServiceType = ServiceType.DeepClean,
                        Address = "789 Pine Rd, Springfield, IL 62703",
                        ScheduledAt = DateTime.UtcNow.AddDays(-2),
                        DurationMinutes = 180,
                        Status = BookingStatus.Completed,
                        Price = 350m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0009",
                        CustomerId = customers[3].Id,
                        WorkerId = workers[1].Id,
                        ServiceType = ServiceType.StandardClean,
                        Address = "321 Elm St, Springfield, IL 62704",
                        ScheduledAt = DateTime.UtcNow.AddDays(-3),
                        DurationMinutes = 120,
                        Status = BookingStatus.Completed,
                        Price = 180m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-20)
                    },
                    new Booking
                    {
                        BookingNumber = "BK-0010",
                        CustomerId = customers[4].Id,
                        WorkerId = workers[2].Id,
                        ServiceType = ServiceType.MoveInOut,
                        Address = "654 Maple Dr, Springfield, IL 62705",
                        ScheduledAt = DateTime.UtcNow.AddDays(4),
                        DurationMinutes = 240,
                        Status = BookingStatus.Scheduled,
                        Price = 520m,
                        Notes = null,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    }
                };
                context.Bookings.AddRange(bookings);
                await context.SaveChangesAsync();
            }

            // Seed LiveJobs
            if (!context.LiveJobs.Any())
            {
                var bookings = context.Bookings
                    .Where(b => b.Status == BookingStatus.InProgress)
                    .ToList();

                var liveJobs = new List<LiveJob>();
                foreach (var booking in bookings)
                {
                    liveJobs.Add(new LiveJob
                    {
                        BookingId = booking.Id,
                        StartedAt = DateTime.UtcNow.AddHours(-2),
                        EstimatedEndTime = booking.ScheduledAt.AddMinutes(booking.DurationMinutes),
                        ActualEndTime = null,
                        Status = LiveJobStatus.InProgress,
                        ProgressMinutes = 120,
                        WorkerNotes = "Work progressing smoothly"
                    });
                }

                context.LiveJobs.AddRange(liveJobs);
                await context.SaveChangesAsync();
            }

            // Seed ExtensionRequests
            if (!context.ExtensionRequests.Any())
            {
                var liveJobs = context.LiveJobs
                    .Where(lj => lj.Status == LiveJobStatus.InProgress)
                    .ToList();

                if (liveJobs.Count > 0)
                {
                    var extensionRequests = new List<ExtensionRequest>
                    {
                        new ExtensionRequest
                        {
                            LiveJobId = liveJobs[0].Id,
                            RequestedMinutes = 30,
                            WorkerReason = "Unexpected heavy soiling found, needs more time",
                            Status = ExtensionStatus.Pending,
                            RequestedAt = DateTime.UtcNow.AddMinutes(-15),
                            DecidedAt = null,
                            AdminNote = null
                        }
                    };

                    if (liveJobs.Count > 1)
                    {
                        extensionRequests.Add(new ExtensionRequest
                        {
                            LiveJobId = liveJobs[1].Id,
                            RequestedMinutes = 45,
                            WorkerReason = "Additional areas requested by customer",
                            Status = ExtensionStatus.AwaitingWorkerResponse,
                            RequestedAt = DateTime.UtcNow.AddHours(-1),
                            DecidedAt = DateTime.UtcNow.AddMinutes(-30),
                            AdminNote = "Tentatively approved - awaiting worker confirmation"
                        });
                    }

                    context.ExtensionRequests.AddRange(extensionRequests);
                    await context.SaveChangesAsync();
                }
            }

            Console.WriteLine("Database seeded successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding database: {ex.Message}");
            throw;
        }
    }
}
