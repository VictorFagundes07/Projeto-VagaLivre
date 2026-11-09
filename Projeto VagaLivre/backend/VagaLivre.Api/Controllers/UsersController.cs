using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Contracts.Users;
using VagaLivre.Api.Data;
using VagaLivre.Api.Domain.Entities;

namespace VagaLivre.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UsersController(VagaLivreDbContext db) : ControllerBase
{
    [HttpGet("me", Name = "GetMyUser")]
    public async Task<ActionResult<UserResponse>> GetMe()
    {
        var user = await db.Users.FindAsync(CurrentUserId());
        return user is null ? NotFound() : Ok(ToResponse(user));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserResponse>> UpdateMe(UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId());
        if (user is null || !user.IsActive) return NotFound();
        user.FullName = request.FullName.Trim(); user.Phone = request.Phone.Trim();
        await db.SaveChangesAsync();
        return Ok(ToResponse(user));
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeactivateMe()
    {
        var user = await db.Users.Include(candidate => candidate.Garages).SingleOrDefaultAsync(candidate => candidate.Id == CurrentUserId());
        if (user is null) return NotFound();
        user.IsActive = false;
        foreach (var garage in user.Garages.Where(garage => garage.IsActive)) garage.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Guid CurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private static UserResponse ToResponse(AppUser user) => new(user.Id, user.FullName, user.Email, user.Phone, user.Rating, user.IsActive, user.CreatedAt);
}
