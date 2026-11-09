using VagaLivre.Api.Domain.Enums;

namespace VagaLivre.Api.Contracts.Garages;

public sealed record GarageResponse(Guid Id, Guid OwnerId, string Title, string Description, string Address, double Latitude, double Longitude, VehicleType MaxVehicleType, bool IsActive, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);
