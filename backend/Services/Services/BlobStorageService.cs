namespace Happy2CleanAPI.Services;

using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _client;
    private readonly string _containerName;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
    {
        _logger = logger;
        var connStr = configuration.GetValue<string>("BlobStorage:ConnectionString")
            ?? throw new InvalidOperationException("BlobStorage:ConnectionString is not configured.");
        _containerName = configuration.GetValue<string>("BlobStorage:ContainerName") ?? "worker-documents";
        _client = new BlobServiceClient(connStr);
    }

    public async Task<(string url, string blobName)> UploadDocumentAsync(
        int workerId,
        string documentType,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var container = _client.GetBlobContainerClient(_containerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.None);

        var ext = Path.GetExtension(fileName);
        var blobName = $"workers/{workerId}/{documentType}/{Guid.NewGuid()}{ext}";
        var blobClient = container.GetBlobClient(blobName);

        await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = contentType });

        _logger.LogInformation("Uploaded document blob {BlobName} for worker {WorkerId}", blobName, workerId);

        return (blobClient.Uri.ToString(), blobName);
    }

    public async Task DeleteDocumentAsync(string blobName)
    {
        var container = _client.GetBlobContainerClient(_containerName);
        var blobClient = container.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
        _logger.LogInformation("Deleted blob {BlobName}", blobName);
    }
}
