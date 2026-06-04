namespace Happy2CleanLocationFunction.Functions;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Happy2CleanLocationFunction.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class LocationBroadcastFunction
{
    private readonly ILogger<LocationBroadcastFunction> _logger;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;

    public LocationBroadcastFunction(
        ILogger<LocationBroadcastFunction> logger,
        IHttpClientFactory httpFactory,
        IConfiguration config)
    {
        _logger = logger;
        _httpFactory = httpFactory;
        _config = config;
    }

    /// <summary>
    /// Triggered whenever a worker posts a location update.
    /// Broadcasts the location to the Azure Web PubSub "jobtracking" hub,
    /// group "booking-{bookingId}", so admin and customer portals receive it in real-time.
    /// </summary>
    [Function("LocationBroadcast")]
    public async Task Run(
        [ServiceBusTrigger("%LocationQueueName%", Connection = "ServiceBusConnectionString")]
        string messageBody)
    {
        LocationMessage? location;
        try
        {
            location = JsonSerializer.Deserialize<LocationMessage>(messageBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize location message: {Body}", messageBody);
            return;
        }

        if (location == null)
        {
            _logger.LogWarning("Received null location message.");
            return;
        }

        _logger.LogInformation(
            "Broadcasting location for worker {WorkerId} on booking {BookingId}: lat={Lat}, lng={Lng}",
            location.WorkerId, location.BookingId, location.Latitude, location.Longitude);

        await BroadcastToWebPubSub(location);
    }

    private async Task BroadcastToWebPubSub(LocationMessage location)
    {
        var connStr = _config["WebPubSubConnectionString"];
        var hubName = _config["WebPubSubHubName"] ?? "jobtracking";

        if (string.IsNullOrEmpty(connStr) || connStr.Contains("DUMMY"))
        {
            _logger.LogWarning("WebPubSub connection string is not configured. Skipping broadcast.");
            return;
        }

        // Parse the endpoint and access key from the connection string
        // Format: Endpoint=https://...;AccessKey=...;Version=1.0;
        var parts = connStr.Split(';')
            .Where(p => p.Contains('='))
            .ToDictionary(
                p => p[..p.IndexOf('=')],
                p => p[(p.IndexOf('=') + 1)..],
                StringComparer.OrdinalIgnoreCase);

        if (!parts.TryGetValue("Endpoint", out var endpoint) ||
            !parts.TryGetValue("AccessKey", out var accessKey))
        {
            _logger.LogError("Invalid WebPubSub connection string format.");
            return;
        }

        // REST API: send message to a group in the hub
        // POST {endpoint}/api/hubs/{hub}/groups/{group}/:send?api-version=2021-10-01
        var groupName = $"booking-{location.BookingId}";
        var url = $"{endpoint.TrimEnd('/')}/api/hubs/{hubName}/groups/{groupName}/:send?api-version=2021-10-01";

        var payload = new WebPubSubBroadcastPayload { Data = location };
        var json = JsonSerializer.Serialize(payload);

        var token = GenerateWebPubSubToken(endpoint, hubName, accessKey);
        var client = _httpFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsync(url,
            new StringContent(json, Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("WebPubSub broadcast failed: {Status} {Body}", response.StatusCode, body);
        }
    }

    private static string GenerateWebPubSubToken(string endpoint, string hubName, string accessKey)
    {
        // Simple HS256 JWT for Azure Web PubSub REST API
        var key = Convert.FromBase64String(accessKey);
        var audience = $"{endpoint.TrimEnd('/')}/client/hubs/{hubName}";
        var now = DateTimeOffset.UtcNow;

        var header = Base64UrlEncode(JsonSerializer.SerializeToUtf8Bytes(new { alg = "HS256", typ = "JWT" }));
        var payloadBytes = JsonSerializer.SerializeToUtf8Bytes(new
        {
            aud = audience,
            iat = now.ToUnixTimeSeconds(),
            exp = now.AddHours(1).ToUnixTimeSeconds()
        });
        var payload = Base64UrlEncode(payloadBytes);
        var sigInput = $"{header}.{payload}";

        using var hmac = new System.Security.Cryptography.HMACSHA256(key);
        var sig = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(sigInput)));

        return $"{sigInput}.{sig}";
    }

    private static string Base64UrlEncode(byte[] input) =>
        Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
