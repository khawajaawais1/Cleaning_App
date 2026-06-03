namespace Happy2CleanAPI.Services;

public interface IBlobStorageService
{
    Task<(string url, string blobName)> UploadDocumentAsync(
        int workerId,
        string documentType,
        Stream fileStream,
        string fileName,
        string contentType);

    Task DeleteDocumentAsync(string blobName);
}
