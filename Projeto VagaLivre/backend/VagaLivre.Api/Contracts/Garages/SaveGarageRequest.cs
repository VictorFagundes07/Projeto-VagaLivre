using System.ComponentModel.DataAnnotations;
using VagaLivre.Api.Domain.Enums;

namespace VagaLivre.Api.Contracts.Garages;

public sealed class SaveGarageRequest
{
    [Required, MaxLength(120)] public string Title { get; init; } = string.Empty;
    [Required, MaxLength(1500)] public string Description { get; init; } = string.Empty;
    [Required, MaxLength(300)] public string Address { get; init; } = string.Empty;
    [Range(-90, 90)] public double Latitude { get; init; }
    [Range(-180, 180)] public double Longitude { get; init; }
    [EnumDataType(typeof(VehicleType))] public VehicleType MaxVehicleType { get; init; }
}
