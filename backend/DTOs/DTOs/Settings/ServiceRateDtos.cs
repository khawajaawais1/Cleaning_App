namespace Happy2CleanAPI.DTOs.Settings;

public record ServiceRateDto(
    int Id,
    string ServiceType,
    string Label,
    string Tagline,
    string Icon,
    decimal RatePerHour,
    bool IsActive,
    int DisplayOrder,
    DateTime UpdatedAt
);

public record UpdateServiceRateDto(
    string? Label,
    string? Tagline,
    string? Icon,
    decimal? RatePerHour,
    bool? IsActive,
    int? DisplayOrder
);

public record CreateServiceRateDto(
    string ServiceType,
    string Label,
    string Tagline,
    string Icon,
    decimal RatePerHour,
    int DisplayOrder
);

public record PlatformFeeDto(decimal Fee, string FeeType);
