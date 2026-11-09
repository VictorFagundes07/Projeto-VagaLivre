using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Contracts.Auth;
using VagaLivre.Api.Contracts.Users;
using VagaLivre.Api.Data;
using VagaLivre.Api.Domain.Entities;
using VagaLivre.Api.Services;

namespace VagaLivre.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(VagaLivreDbContext db, PasswordService passwords, TokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var cpf = new string(request.Cpf.Where(char.IsDigit).ToArray());
        if (await db.Users.AnyAsync(user => user.Email == email || user.Cpf == cpf)) return Conflict(new { message = "E-mail ou CPF já cadastrado." });
        var user = new AppUser { FullName = request.FullName.Trim(), Email = email, Phone = request.Phone.Trim(), Cpf = cpf, PasswordHash = passwords.Hash(request.Password) };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return CreatedAtRoute("GetMyUser", new UserResponse(user.Id, user.FullName, user.Email, user.Phone, user.Rating, user.IsActive, user.CreatedAt));
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(candidate => candidate.Email == request.Email.Trim().ToLowerInvariant());
        if (user is null || !user.IsActive || !passwords.Verify(request.Password, user.PasswordHash)) return Unauthorized(new { message = "E-mail ou senha inválidos." });
        return Ok(new { accessToken = tokens.Create(user), tokenType = "Bearer" });
    }
}
