namespace Happy2CleanAPI.DTOs.Worker;

public record WorkerDocumentDto(
    int Id,
    string Type,
    string Label,
    string Status,
    DateTime? UploadedAt,
    DateTime? VerifiedAt,
    DateTime? ExpiresAt,
    string? FileName,
    string? BlobUrl,
    string? RejectionReason
);
