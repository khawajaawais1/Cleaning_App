# Happy2Clean API — .NET 8 Backend

ASP.NET Core 8 Web API for the Happy2Clean cleaning service management platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | .NET 8 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server (LocalDB for dev) |
| Auth | JWT Bearer (BCrypt password hashing) |
| Docs | Swagger / OpenAPI |

## Project Structure

```
Happy2CleanAPI/
├── Controllers/          # REST API endpoints (6 controllers)
├── Data/
│   ├── ApplicationDbContext.cs   # EF Core DbContext
│   └── DataSeeder.cs             # Dev seed data
├── DTOs/                 # Request/Response shapes per feature
│   ├── Auth/
│   ├── Booking/
│   ├── Dashboard/
│   ├── ExtensionRequest/
│   ├── LiveJob/
│   └── Worker/
├── Middleware/
│   └── ExceptionMiddleware.cs    # Global error handler
├── Models/               # Domain entities
├── Services/             # Business logic (interface + impl)
├── appsettings.json
└── Program.cs
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server or SQL Server LocalDB (comes with Visual Studio)
- EF Core CLI tools: `dotnet tool install --global dotnet-ef`

## Quick Start

```bash
# 1. Clone / open the project
cd Happy2CleanAPI

# 2. Restore packages
dotnet restore

# 3. (Optional) Update connection string in appsettings.Development.json

# 4. Apply migrations & seed the database
dotnet ef database update

# 5. Run the API
dotnet run

# Swagger UI auto-opens at http://localhost:5000
```

> The app calls `database.Migrate()` + `DataSeeder.SeedAsync()` on startup,
> so you don't need to run `dotnet ef database update` manually in dev.

## Default Credentials (seeded)

| Field | Value |
|-------|-------|
| Email | admin@happy2clean.com |
| Password | Admin123! |

## API Endpoints

### Auth  `POST /api/auth/login`
```json
{ "email": "admin@happy2clean.com", "password": "Admin123!" }
```
Returns `{ user, token, expiresIn }` — include the token as `Authorization: Bearer <token>` on all subsequent requests.

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | KPI stats card data |
| GET | `/api/dashboard/recent-bookings` | Last 5 bookings |

### Workers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workers` | All workers (`?status=pending`) |
| GET | `/api/workers/applications` | Pending applications only |
| GET | `/api/workers/{id}` | Single worker |
| PUT | `/api/workers/{id}/approve` | Approve application |
| PUT | `/api/workers/{id}/reject` | Reject with reason |
| PUT | `/api/workers/{id}/suspend` | Suspend active worker |

### Bookings
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookings` | All bookings (`?status=`, `?date=`) |
| GET | `/api/bookings/{id}` | Single booking |
| POST | `/api/bookings` | Create new booking |
| PUT | `/api/bookings/{id}` | Update booking |
| DELETE | `/api/bookings/{id}` | Cancel booking |

### Live Jobs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/live-jobs` | Active live jobs |
| GET | `/api/live-jobs/{id}` | Single job |
| PUT | `/api/live-jobs/{id}/start` | Start a job |
| PUT | `/api/live-jobs/{id}/complete` | Complete a job |

### Extension Requests
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/extension-requests` | All requests (`?status=pending`) |
| GET | `/api/extension-requests/{id}` | Single request |
| PUT | `/api/extension-requests/{id}/approve` | Approve extension |
| PUT | `/api/extension-requests/{id}/deny` | Deny with note |
| PUT | `/api/extension-requests/{id}/ask-worker` | Ask worker for clarification |

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=Happy2CleanDB;Trusted_Connection=True"
  },
  "JwtSettings": {
    "SecretKey": "Happy2CleanSuperSecretKey2024!XYZ123",
    "Issuer": "Happy2CleanAPI",
    "Audience": "Happy2CleanAdmin",
    "ExpirationHours": 24
  }
}
```

For production, override `SecretKey` and `ConnectionStrings` via environment variables or Azure Key Vault.

## Database Migrations

```bash
# Create a new migration after model changes
dotnet ef migrations add <MigrationName>

# Apply to database
dotnet ef database update

# Rollback
dotnet ef database update <PreviousMigrationName>
```

## CORS

By default, the API allows requests from `http://localhost:4200` (Angular dev server).  
For production, update the `AllowedOrigins` in `Program.cs`.
