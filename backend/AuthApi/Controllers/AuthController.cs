using System.Threading.Tasks;
using AuthApi.Dtos;
using AuthApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuthApi.Controllers;

[ApiController]
[Route("api/[controller]")]

//endpoint içinde logic olmayacağı için burayı düzenleyip yeni bir dto ve 2 tane servis oluşturduk artık logic kısımları oralara aktarıldı daha temiz oldu
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Geçersiz istek." });

        var result = await _auth.RegisterAsync(req);
        if (!result.Success)
        {
            // e-posta zaten kayıtlı ise 409; diğer durumlarda 400 döndürmek hoş olur
            if (result.Message?.Contains("zaten kayıtlı") == true)
                return Conflict(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Geçersiz istek." });

        var result = await _auth.LoginAsync(req);
        if (!result.Success)
            return Unauthorized(new { message = result.Message });

        return Ok(new { token = result.Token });
    }
}
