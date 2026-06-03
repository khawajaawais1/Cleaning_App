namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Worker;
using Happy2CleanAPI.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

/// <summary>
/// Service for worker operations.
/// </summary>
public class WorkerService : IWorkerService
{
    private readonly ApplicationDbContext _context;

    public WorkerService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkerDto>> GetAllAsync(string? statusFilter = null)
    {
        var query = _context.Workers.AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<WorkerStatus>(statusFilter, true, out var status))
        {
            query = query.Where(w => w.Status == status);
        }

        var workers = await query.ToListAsync();
        return workers.Select(MapToDto).ToList();
    }

    public async Task<WorkerDto?> GetByIdAsync(int id)
    {
        var worker = await _context.Workers.FindAsync(id);
        return worker == null ? null : MapToDto(worker);
    }

    public async Task<List<WorkerDto>> GetPendingApplicationsAsync()
    {
        var workers = await _context.Workers
            .Where(w => w.Status == WorkerStatus.Pending)
            .ToListAsync();

        return workers.Select(MapToDto).ToList();
    }

    public async Task<bool> ApproveWorkerAsync(int id)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null || worker.Status != WorkerStatus.Pending)
            return false;

        worker.Status = WorkerStatus.Active;
        worker.ApprovedAt = DateTime.UtcNow;
        worker.RejectionReason = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectWorkerAsync(int id, string reason)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null || worker.Status != WorkerStatus.Pending)
            return false;

        worker.Status = WorkerStatus.Rejected;
        worker.RejectionReason = reason;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SuspendWorkerAsync(int id)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null || worker.Status != WorkerStatus.Active)
            return false;

        worker.Status = WorkerStatus.Suspended;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreWorkerAsync(int id)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null) return false;
        if (worker.Status != WorkerStatus.Rejected && worker.Status != WorkerStatus.Suspended)
            return false;

        worker.Status = WorkerStatus.Active;
        worker.RejectionReason = null;
        worker.ApprovedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static WorkerDto MapToDto(Worker worker)
    {
        var nameParts = worker.FullName.Split(' ', 2);
        var status = worker.Status switch
        {
            WorkerStatus.Pending   => "pending",
            WorkerStatus.Active    => "active",
            WorkerStatus.Rejected  => "rejected",
            WorkerStatus.Suspended => "suspended",
            _                      => "pending"
        };

        return new WorkerDto(
            Id:               worker.Id.ToString(),
            FirstName:        nameParts.Length > 0 ? nameParts[0] : worker.FullName,
            LastName:         nameParts.Length > 1 ? nameParts[1] : "",
            Email:            worker.Email,
            Phone:            worker.Phone,
            City:             worker.City,
            ServiceType:      worker.ServiceType,
            Status:           status,
            Rating:           worker.Rating,
            CompletedJobs:    worker.CompletedJobs,
            IsOnline:         worker.IsOnline,
            AppliedDate:      worker.AppliedAt,
            ApprovedDate:     worker.ApprovedAt,
            RejectionReason:  worker.RejectionReason
        );
    }

    public async Task<WorkerDto> CreateAsync(CreateWorkerDto dto)
    {
        var nameParts = dto.FullName.Trim().Split(' ', 2);
        var initials = (nameParts[0][0].ToString() + (nameParts.Length > 1 ? nameParts[1][0].ToString() : "")).ToUpper();

        var worker = new Worker
        {
            FullName = dto.FullName.Trim(),
            Initials = initials,
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone,
            City = dto.City,
            ServiceType = dto.ServiceType,
            Rating = dto.Rating,
            CompletedJobs = dto.CompletedJobs,
            IsOnline = dto.IsOnline,
            Status = WorkerStatus.Active,
            AppliedAt = DateTime.UtcNow,
            ApprovedAt = DateTime.UtcNow,
            PasswordHash = BCrypt.HashPassword(string.IsNullOrEmpty(dto.Password) ? "worker123" : dto.Password)
        };

        _context.Workers.Add(worker);
        await _context.SaveChangesAsync();
        return MapToDto(worker);
    }

    public async Task<WorkerDto?> UpdateAsync(int id, UpdateWorkerDto dto)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null) return null;

        var nameParts = dto.FullName.Trim().Split(' ', 2);
        worker.FullName = dto.FullName.Trim();
        worker.Initials = (nameParts[0][0].ToString() + (nameParts.Length > 1 ? nameParts[1][0].ToString() : "")).ToUpper();
        worker.Email = dto.Email.Trim().ToLower();
        worker.Phone = dto.Phone;
        worker.City = dto.City;
        worker.ServiceType = dto.ServiceType;
        worker.Rating = dto.Rating;
        worker.CompletedJobs = dto.CompletedJobs;
        worker.IsOnline = dto.IsOnline;
        if (!string.IsNullOrEmpty(dto.Status) && Enum.TryParse<WorkerStatus>(dto.Status, true, out var status))
            worker.Status = status;

        await _context.SaveChangesAsync();
        return MapToDto(worker);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var worker = await _context.Workers.FindAsync(id);
        if (worker == null) return false;
        _context.Workers.Remove(worker);
        await _context.SaveChangesAsync();
        return true;
    }
}
