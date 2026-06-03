namespace Happy2CleanAPI.DTOs.Settings;

public record SystemSettingsDto(
    bool WorkerPortalEnabled,
    DateTime? WorkerPortalEnabledAt,
    DateTime? WorkerPortalDisabledAt,
    string? WorkerPortalDisabledReason,
    decimal PlatformFee,
    string PlatformFeeType,
    DateTime UpdatedAt
);

public record ToggleWorkerPortalDto(bool Enabled, string? Reason);
