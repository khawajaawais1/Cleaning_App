namespace Happy2CleanAPI.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

/// <summary>
/// Design-time factory used by EF Core migrations.
/// Bypasses the full app startup so dotnet-ef doesn't try to wire up
/// Azure Service Bus, Blob Storage, etc. with dummy connection strings.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection not found. Make sure appsettings.Development.json has the real connection string.");

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new ApplicationDbContext(options);
    }
}
