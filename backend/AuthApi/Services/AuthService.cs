using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AuthApi.Data;
using AuthApi.Dtos;
using AuthApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly JwtTokenService _jwt;

       
        private static readonly Regex EmailRx =
            new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled);

        public AuthService(AppDbContext db, JwtTokenService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        public async Task<AuthResult> RegisterAsync(RegisterRequest req)
        {
            // Temel doğrulamalar
            if (req is null) return new(false, "Geçersiz istek.");
            if (!EmailRx.IsMatch(req.Email)) return new(false, "Geçerli bir e-posta giriniz.");
            if (!IsStrong(req.Password)) return new(false, "Şifre zayıf.");

            var exists = await _db.Users.AnyAsync(u => u.Email == req.Email);
            if (exists) return new(false, "Bu e-posta zaten kayıtlı.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new(true, "Kayıt başarılı.");
        }

        public async Task<AuthResult> LoginAsync(LoginRequest req)
        {
            if (req is null) return new(false, "Geçersiz istek.");

            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);
            if (user is null) return new(false, "E-posta veya şifre hatalı.");

            var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            if (!ok) return new(false, "E-posta veya şifre hatalı.");

            var token = _jwt.Create(user);
            return new(true, Token: token);
        }

        public bool IsStrong(string p) =>
            p?.Length >= 6 &&
            p.Any(char.IsUpper) &&
            p.Any(char.IsLower) &&
            p.Any(char.IsDigit) &&
            p.Any(ch => ".!@#$%^&*".Contains(ch));
    }
}
