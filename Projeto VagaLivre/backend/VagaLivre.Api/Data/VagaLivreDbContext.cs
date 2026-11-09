using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Domain.Entities;

namespace VagaLivre.Api.Data;

public sealed class VagaLivreDbContext(DbContextOptions<VagaLivreDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Garage> Garages => Set<Garage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(user => user.Email).IsUnique();
            entity.HasIndex(user => user.Cpf).IsUnique();
            entity.Property(user => user.Rating).HasPrecision(3, 2);
        });

        modelBuilder.Entity<Garage>(entity =>
        {
            entity.ToTable("garages");
            entity.HasIndex(garage => new { garage.OwnerId, garage.IsActive });
            entity.HasOne(garage => garage.Owner)
                .WithMany(user => user.Garages)
                .HasForeignKey(garage => garage.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
