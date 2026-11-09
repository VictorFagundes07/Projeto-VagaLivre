using System.ComponentModel.DataAnnotations;

namespace VagaLivre.Api.Contracts.Users;

public sealed class UpdateUserRequest
{
    [Required, MaxLength(150)] public string FullName { get; init; } = string.Empty;
    [Required, MaxLength(20)] public string Phone { get; init; } = string.Empty;
}
