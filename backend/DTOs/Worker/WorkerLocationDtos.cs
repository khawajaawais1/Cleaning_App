namespace Happy2CleanAPI.DTOs.Worker;

public record LocationUpdateDto(double Latitude, double Longitude, int? ActiveBookingId);

public record LocationMessage(
    int WorkerId,
    string WorkerName,
    int BookingId,
    double Latitude,
    double Longitude,
    DateTime Timestamp
);
