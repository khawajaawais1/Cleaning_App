namespace Happy2CleanAPI.DTOs.ExtensionRequest;

/// <summary>
/// DTO for approving or denying an extension request.
/// </summary>
public record ExtensionDecisionDto(
    string? AdminNote
);
