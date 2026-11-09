using System.ComponentModel.DataAnnotations;

namespace VagaLivre.Api.Domain.Entities;

public sealed class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(11)]
    public string Cpf { get; set; } = string.Empty;

    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    public decimal Rating { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<Garage> Garages { get; set; } = new List<Garage>();
}
