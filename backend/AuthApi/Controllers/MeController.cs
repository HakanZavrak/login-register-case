using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthApi.Controllers;

[ApiController]
[Route("api")]
public class MeController : ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.Identity?.Name ?? "unknown";
        return Ok(new { email });
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { ok = true, at = DateTime.UtcNow });
}
