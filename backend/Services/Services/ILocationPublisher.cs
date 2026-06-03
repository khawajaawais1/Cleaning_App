namespace Happy2CleanAPI.Services;

using Happy2CleanAPI.DTOs.Worker;

public interface ILocationPublisher
{
    Task PublishAsync(LocationMessage message);
}
