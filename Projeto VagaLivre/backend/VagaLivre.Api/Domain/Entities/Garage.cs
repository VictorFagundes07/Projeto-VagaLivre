using System.ComponentModel.DataAnnotations;
using VagaLivre.Api.Domain.Enums;

namespace VagaLivre.Api.Domain.Entities;

public sealed class Garage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public VehicleType MaxVehicleType { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public AppUser Owner { get; set; } = null!;
}
