namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.Data;
using Happy2CleanAPI.DTOs.Booking;
using Happy2CleanAPI.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for booking operations.
/// </summary>
public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;

    public BookingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingDto>> GetAllAsync(string? statusFilter = null, DateTime? dateFilter = null)
    {
        var query = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Worker)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<BookingStatus>(statusFilter, true, out var status))
        {
            query = query.Where(b => b.Status == status);
        }

        if (dateFilter.HasValue)
        {
            query = query.Where(b => b.ScheduledAt.Date == dateFilter.Value.Date);
        }

        var bookings = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return bookings.Select(MapToDto).ToList();
    }

    public async Task<BookingDto?> GetByIdAsync(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Worker)
            .FirstOrDefaultAsync(b => b.Id == id);

        return booking == null ? null : MapToDto(booking);
    }

    public async Task<BookingDto> CreateAsync(CreateBookingDto dto)
    {
        var customer = await _context.Customers.FindAsync(dto.CustomerId);
        if (customer == null)
            throw new InvalidOperationException("Customer not found");

        Worker? worker = null;
        if (dto.WorkerId.HasValue)
        {
            worker = await _context.Workers.FindAsync(dto.WorkerId.Value);
            if (worker == null)
                throw new InvalidOperationException("Worker not found");
        }

        if (!Enum.TryParse<ServiceType>(dto.ServiceType, true, out var serviceType))
            throw new InvalidOperationException("Invalid service type");

        var bookingNumber = await GenerateBookingNumberAsync();
        var booking = new Booking
        {
            BookingNumber = bookingNumber,
            CustomerId = dto.CustomerId,
            WorkerId = dto.WorkerId,
            ServiceType = serviceType,
            Address = dto.Address,
            ScheduledAt = dto.ScheduledAt,
            DurationMinutes = dto.DurationMinutes,
            Status = BookingStatus.Scheduled,
            Price = dto.Price,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        booking.Customer = customer;
        booking.Worker = worker;

        return MapToDto(booking);
    }

    public async Task<bool> UpdateAsync(int id, CreateBookingDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null || booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            return false;

        var customer = await _context.Customers.FindAsync(dto.CustomerId);
        if (customer == null)
            return false;

        Worker? worker = null;
        if (dto.WorkerId.HasValue)
        {
            worker = await _context.Workers.FindAsync(dto.WorkerId.Value);
            if (worker == null)
                return false;
        }

        if (!Enum.TryParse<ServiceType>(dto.ServiceType, true, out var serviceType))
            return false;

        booking.CustomerId = dto.CustomerId;
        booking.WorkerId = dto.WorkerId;
        booking.ServiceType = serviceType;
        booking.Address = dto.Address;
        booking.ScheduledAt = dto.ScheduledAt;
        booking.DurationMinutes = dto.DurationMinutes;
        booking.Price = dto.Price;
        booking.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null || booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            return false;

        booking.Status = BookingStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignWorkerAsync(int id, int workerId)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null || booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            return false;

        var worker = await _context.Workers.FindAsync(workerId);
        if (worker == null)
            return false;

        booking.WorkerId = workerId;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePermanentAsync(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.LiveJob)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return false;

        // Only allow deleting cancelled bookings
        if (booking.Status != BookingStatus.Cancelled)
            return false;

        _context.Bookings.Remove(booking); // LiveJob + ExtensionRequests cascade automatically
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return false;
        if (!Enum.TryParse<BookingStatus>(status, true, out var newStatus)) return false;

        booking.Status = newStatus;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<string> GenerateBookingNumberAsync()
    {
        var lastBooking = await _context.Bookings
            .OrderByDescending(b => b.Id)
            .FirstOrDefaultAsync();

        int number = 1;
        if (lastBooking != null && lastBooking.BookingNumber.StartsWith("BK-"))
        {
            if (int.TryParse(lastBooking.BookingNumber.Substring(3), out int lastNumber))
            {
                number = lastNumber + 1;
            }
        }

        return $"BK-{number:D4}";
    }

    private static BookingDto MapToDto(Booking booking)
    {
        var customerParts = booking.Customer?.FullName?.Split(' ', 2) ?? [];
        var workerParts   = booking.Worker?.FullName?.Split(' ', 2) ?? [];
        var endTime       = booking.ScheduledAt.AddMinutes(booking.DurationMinutes);

        var status = booking.Status switch
        {
            BookingStatus.Scheduled  => "scheduled",
            BookingStatus.InProgress => "in_progress",
            BookingStatus.Completed  => "completed",
            BookingStatus.Cancelled  => "cancelled",
            _                        => "scheduled"
        };

        return new BookingDto(
            Id:           booking.Id.ToString(),
            BookingNumber: booking.BookingNumber,
            CustomerId:   booking.CustomerId.ToString(),
            Customer:     booking.Customer == null ? null : new BookingCustomerDto(
                              FirstName: customerParts.Length > 0 ? customerParts[0] : "",
                              LastName:  customerParts.Length > 1 ? customerParts[1] : "",
                              Email:     booking.Customer.Email,
                              Phone:     booking.Customer.Phone),
            WorkerId:     booking.WorkerId?.ToString(),
            Worker:       booking.Worker == null ? null : new BookingWorkerDto(
                              FirstName: workerParts.Length > 0 ? workerParts[0] : "",
                              LastName:  workerParts.Length > 1 ? workerParts[1] : "",
                              Rating:    booking.Worker.Rating),
            ServiceType:  booking.ServiceType.ToString(),
            Address:      booking.Address,
            Latitude:     booking.Latitude,
            Longitude:    booking.Longitude,
            StartTime:    booking.ScheduledAt,
            EndTime:      endTime,
            Duration:     booking.DurationMinutes,
            Price:        booking.Price,
            Status:       status,
            Notes:        booking.Notes,
            CreatedAt:    booking.CreatedAt,
            UpdatedAt:    booking.CreatedAt   // use CreatedAt as fallback; real apps track UpdatedAt
        );
    }
}
