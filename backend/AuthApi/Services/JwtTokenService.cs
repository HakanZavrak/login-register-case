using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthApi.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthApi.Services;

public class JwtTokenService(IConfiguration cfg)
{
    public string Create(User user)
    {
        var issuer = cfg["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer missing");
        var audience = cfg["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience missing");
        var keyStr = cfg["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Email),             
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), 
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),

            new(ClaimTypes.Name, user.Email),
            new("uid", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: now.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
