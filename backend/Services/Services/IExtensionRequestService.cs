namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.ExtensionRequest;

/// <summary>
/// Service interface for extension request operations.
/// </summary>
public interface IExtensionRequestService
{
    Task<List<ExtensionRequestDto>> GetAllAsync(string? statusFilter = null);
    Task<ExtensionRequestDto?> GetByIdAsync(int id);
    Task<bool> ApproveAsync(int id, string? adminNote = null);
    Task<bool> DenyAsync(int id, string? adminNote = null);
    Task<bool> AskWorkerAsync(int id, string? adminNote = null);
}
