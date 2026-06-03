namespace Happy2CleanAPI.DTOs.Booking;

/// <summary>
/// DTO for booking information — matches the Angular Booking model.
/// </summary>
public record BookingDto(
    string Id,
    string BookingNumber,
    string CustomerId,
    BookingCustomerDto? Customer,
    string? WorkerId,
    BookingWorkerDto? Worker,
    string ServiceType,
    string Address,
    double? Latitude,
    double? Longitude,
    DateTime StartTime,
    DateTime EndTime,
    int Duration,
    decimal Price,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record BookingCustomerDto(string FirstName, string LastName, string Email, string Phone);
public record BookingWorkerDto(string FirstName, string LastName, double Rating);
