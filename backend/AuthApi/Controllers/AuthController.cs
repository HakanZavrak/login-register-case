using AuthApi.Data;
using AuthApi.Dtos;
using AuthApi.Models;
using AuthApi.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace AuthApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, JwtTokenService jwt) : ControllerBase
{
    static readonly Regex EmailRx = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!EmailRx.IsMatch(req.Email))
            return BadRequest(new { message = "Geçerli e-posta girin." });

        if (!IsStrong(req.Password))
            return BadRequest(new { message = "Şifre zayıf. En az 6 karakter, 1 büyük, 1 küçük, 1 rakam, 1 özel karakter." });

        var exists = await db.Users.AnyAsync(u => u.Email == req.Email);
        if (exists) return BadRequest(new { message = "E-posta zaten kayıtlı." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);
        if (user is null) return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        var token = jwt.Create(user);
        return Ok(new { token });
    }

    static bool IsStrong(string p) =>
        p.Length >= 6 &&
        p.Any(char.IsUpper) &&
        p.Any(char.IsLower) &&
        p.Any(char.IsDigit) &&
        p.Any(ch => ".!@#$%^&*".Contains(ch));
}
