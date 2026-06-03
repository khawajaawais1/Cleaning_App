namespace Happy2CleanAPI.Models;

public class WorkerDocument
{
    public int Id { get; set; }
    public int WorkerId { get; set; }
    public Worker Worker { get; set; } = null!;
    public string DocumentType { get; set; } = string.Empty; // id_passport, dbs_check, proof_of_address, right_to_work
    public string Label { get; set; } = string.Empty;
    public string? BlobUrl { get; set; }
    public string? BlobName { get; set; }
    public string? FileName { get; set; }
    public string Status { get; set; } = "pending"; // pending | verified | rejected | expired
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public DateTime? VerifiedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? RejectionReason { get; set; }
}
