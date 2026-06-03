namespace Happy2CleanAPI.Services;

using Azure.Messaging.ServiceBus;
using Happy2CleanAPI.DTOs.Worker;
using System.Text.Json;

public class ServiceBusLocationPublisher : ILocationPublisher, IAsyncDisposable
{
    private readonly ServiceBusSender _sender;
    private readonly ServiceBusClient _client;
    private readonly ILogger<ServiceBusLocationPublisher> _logger;

    public ServiceBusLocationPublisher(IConfiguration configuration, ILogger<ServiceBusLocationPublisher> logger)
    {
        _logger = logger;
        var connStr = configuration.GetValue<string>("ServiceBus:ConnectionString")
            ?? throw new InvalidOperationException("ServiceBus:ConnectionString is not configured.");
        var queueName = configuration.GetValue<string>("ServiceBus:LocationQueueName") ?? "worker-location-updates";
        _client = new ServiceBusClient(connStr);
        _sender = _client.CreateSender(queueName);
    }

    public async Task PublishAsync(LocationMessage message)
    {
        var json = JsonSerializer.Serialize(message);
        var sbMessage = new ServiceBusMessage(json)
        {
            ContentType = "application/json",
            Subject = "WorkerLocationUpdate",
            MessageId = $"{message.WorkerId}-{message.Timestamp.Ticks}"
        };

        await _sender.SendMessageAsync(sbMessage);
        _logger.LogInformation("Published location update for worker {WorkerId} on booking {BookingId}", message.WorkerId, message.BookingId);
    }

    public async ValueTask DisposeAsync()
    {
        await _sender.DisposeAsync();
        await _client.DisposeAsync();
    }
}
