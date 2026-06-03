namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// Service interface for booking operations.
/// </summary>
public interface IBookingService
{
    Task<List<BookingDto>> GetAllAsync(string? statusFilter = null, DateTime? dateFilter = null);
    Task<BookingDto?> GetByIdAsync(int id);
    Task<BookingDto> CreateAsync(CreateBookingDto dto);
    Task<bool> UpdateAsync(int id, CreateBookingDto dto);
    Task<bool> CancelAsync(int id);
    Task<bool> AssignWorkerAsync(int id, int workerId);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<bool> DeletePermanentAsync(int id);
}
