using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Contracts.Garages;
using VagaLivre.Api.Data;
using VagaLivre.Api.Domain.Entities;

namespace VagaLivre.Api.Controllers;

[ApiController]
[Route("api/garages")]
public sealed class GaragesController(VagaLivreDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GarageResponse>>> List() => Ok(await db.Garages.AsNoTracking().Where(garage => garage.IsActive).OrderByDescending(garage => garage.CreatedAt).Select(garage => ToResponse(garage)).ToListAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GarageResponse>> Get(Guid id)
    {
        var garage = await db.Garages.AsNoTracking().SingleOrDefaultAsync(candidate => candidate.Id == id && candidate.IsActive);
        return garage is null ? NotFound() : Ok(ToResponse(garage));
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<GarageResponse>>> ListMine() => Ok(await db.Garages.AsNoTracking().Where(garage => garage.OwnerId == CurrentUserId()).OrderByDescending(garage => garage.CreatedAt).Select(garage => ToResponse(garage)).ToListAsync());

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<GarageResponse>> Create(SaveGarageRequest request)
    {
        var garage = new Garage { OwnerId = CurrentUserId() };
        Apply(request, garage); db.Garages.Add(garage); await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { garage.Id }, ToResponse(garage));
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<GarageResponse>> Update(Guid id, SaveGarageRequest request)
    {
        var garage = await db.Garages.SingleOrDefaultAsync(candidate => candidate.Id == id && candidate.OwnerId == CurrentUserId());
        if (garage is null) return NotFound();
        Apply(request, garage); await db.SaveChangesAsync();
        return Ok(ToResponse(garage));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var garage = await db.Garages.SingleOrDefaultAsync(candidate => candidate.Id == id && candidate.OwnerId == CurrentUserId());
        if (garage is null) return NotFound();
        garage.IsActive = false; garage.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Guid CurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private static void Apply(SaveGarageRequest request, Garage garage)
    {
        garage.Title = request.Title.Trim(); garage.Description = request.Description.Trim(); garage.Address = request.Address.Trim();
        garage.Latitude = request.Latitude; garage.Longitude = request.Longitude; garage.MaxVehicleType = request.MaxVehicleType; garage.UpdatedAt = DateTimeOffset.UtcNow;
    }
    private static GarageResponse ToResponse(Garage garage) => new(garage.Id, garage.OwnerId, garage.Title, garage.Description, garage.Address, garage.Latitude, garage.Longitude, garage.MaxVehicleType, garage.IsActive, garage.CreatedAt, garage.UpdatedAt);
}
