namespace Happy2CleanLocationFunction.Models;

public class LocationMessage
{
    public int WorkerId { get; set; }
    public string WorkerName { get; set; } = string.Empty;
    public int BookingId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime Timestamp { get; set; }
}

public class WebPubSubBroadcastPayload
{
    public string Type { get; set; } = "locationUpdate";
    public LocationMessage Data { get; set; } = null!;
}
