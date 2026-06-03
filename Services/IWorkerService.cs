namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.Worker;

/// <summary>
/// Service interface for worker operations.
/// </summary>
public interface IWorkerService
{
    Task<List<WorkerDto>> GetAllAsync(string? statusFilter = null);
    Task<WorkerDto?> GetByIdAsync(int id);
    Task<List<WorkerDto>> GetPendingApplicationsAsync();
    Task<bool> ApproveWorkerAsync(int id);
    Task<bool> RejectWorkerAsync(int id, string reason);
    Task<bool> SuspendWorkerAsync(int id);
    Task<bool> RestoreWorkerAsync(int id);
    Task<WorkerDto> CreateAsync(CreateWorkerDto dto);
    Task<WorkerDto?> UpdateAsync(int id, UpdateWorkerDto dto);
    Task<bool> DeleteAsync(int id);
}
