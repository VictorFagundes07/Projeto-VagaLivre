namespace VagaLivre.Api.Contracts.Users;

public sealed record UserResponse(Guid Id, string FullName, string Email, string Phone, decimal Rating, bool IsActive, DateTimeOffset CreatedAt);
