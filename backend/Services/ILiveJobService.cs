namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.LiveJob;

/// <summary>
/// Service interface for live job operations.
/// </summary>
public interface ILiveJobService
{
    Task<List<LiveJobDto>> GetAllActiveAsync();
    Task<LiveJobDto?> GetByIdAsync(int id);
    Task<bool> StartJobAsync(int id);
    Task<bool> CompleteJobAsync(int id);
}
