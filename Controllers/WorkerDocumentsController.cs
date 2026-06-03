namespace Happy2CleanAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Happy2CleanAPI.Data;
using Happy2CleanAPI.Models;
using Happy2CleanAPI.DTOs.Worker;
using Happy2CleanAPI.Services;
using System.Security.Claims;

[ApiController]
[Route("api/worker/documents")]
[Authorize(Roles = "Worker")]
public class WorkerDocumentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IBlobStorageService _blob;

    private static readonly Dictionary<string, string> DocumentLabels = new()
    {
        ["id_passport"]      = "Passport / Photo ID",
        ["dbs_check"]        = "DBS Certificate",
        ["proof_of_address"] = "Proof of Address",
        ["right_to_work"]    = "Right to Work",
        ["insurance"]        = "Insurance Certificate"
    };

    public WorkerDocumentsController(ApplicationDbContext db, IBlobStorageService blob)
    {
        _db = db;
        _blob = blob;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        var workerId = GetWorkerId();
        var docs = await _db.WorkerDocuments
            .Where(d => d.WorkerId == workerId)
            .OrderBy(d => d.UploadedAt)
            .ToListAsync();

        return Ok(docs.Select(MapToDto));
    }

    [HttpPost]
    [RequestSizeLimit(20_000_000)] // 20 MB max
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string documentType)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!DocumentLabels.ContainsKey(documentType))
            return BadRequest(new { message = "Invalid document type." });

        var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png", "image/jpg" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only PDF, JPG, and PNG files are allowed." });

        var workerId = GetWorkerId();

        await using var stream = file.OpenReadStream();
        var (url, blobName) = await _blob.UploadDocumentAsync(
            workerId, documentType, stream, file.FileName, file.ContentType);

        // Replace existing document of same type
        var existing = await _db.WorkerDocuments
            .FirstOrDefaultAsync(d => d.WorkerId == workerId && d.DocumentType == documentType);

        if (existing != null)
        {
            if (existing.BlobName != null)
                await _blob.DeleteDocumentAsync(existing.BlobName);
            _db.WorkerDocuments.Remove(existing);
        }

        var doc = new WorkerDocument
        {
            WorkerId = workerId,
            DocumentType = documentType,
            Label = DocumentLabels[documentType],
            BlobUrl = url,
            BlobName = blobName,
            FileName = file.FileName,
            Status = "pending",
            UploadedAt = DateTime.UtcNow
        };

        _db.WorkerDocuments.Add(doc);
        await _db.SaveChangesAsync();

        return Ok(MapToDto(doc));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var workerId = GetWorkerId();
        var doc = await _db.WorkerDocuments
            .FirstOrDefaultAsync(d => d.Id == id && d.WorkerId == workerId);

        if (doc == null) return NotFound();

        if (doc.BlobName != null)
            await _blob.DeleteDocumentAsync(doc.BlobName);

        _db.WorkerDocuments.Remove(doc);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private int GetWorkerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static WorkerDocumentDto MapToDto(WorkerDocument d) => new(
        Id: d.Id,
        Type: d.DocumentType,
        Label: d.Label,
        Status: d.Status,
        UploadedAt: d.UploadedAt,
        VerifiedAt: d.VerifiedAt,
        ExpiresAt: d.ExpiresAt,
        FileName: d.FileName,
        BlobUrl: d.BlobUrl,
        RejectionReason: d.RejectionReason
    );
}
