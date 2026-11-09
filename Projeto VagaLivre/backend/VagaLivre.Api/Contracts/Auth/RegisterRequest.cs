using System.ComponentModel.DataAnnotations;

namespace VagaLivre.Api.Contracts.Auth;

public sealed class RegisterRequest
{
    [Required, MaxLength(150)] public string FullName { get; init; } = string.Empty;
    [Required, EmailAddress, MaxLength(150)] public string Email { get; init; } = string.Empty;
    [Required, MaxLength(20)] public string Phone { get; init; } = string.Empty;
    [Required, RegularExpression(@"^\d{11}$", ErrorMessage = "CPF deve conter 11 dígitos.")] public string Cpf { get; init; } = string.Empty;
    [Required, MinLength(8), MaxLength(100)] public string Password { get; init; } = string.Empty;
}
