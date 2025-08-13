using AuthApi.Data;
using AuthApi.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MetricsController : ControllerBase
    {
        private readonly AppMetrics _metrics;
        private readonly AppDbContext _db;
        private readonly EndpointDataSource _endpoints;
        private static readonly DateTime _startTime = DateTime.UtcNow;

        public MetricsController(AppMetrics metrics, AppDbContext db, EndpointDataSource endpoints)
        {
            _metrics = metrics;
            _db = db;
            _endpoints = endpoints;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var users = await _db.Users.CountAsync();
            var endpointsCount = _endpoints.Endpoints
                .OfType<RouteEndpoint>()
                .Select(e => e.RoutePattern.RawText)
                .Where(p => p != null && !p.StartsWith("/swagger"))
                .Distinct()
                .Count();

            var uptime = DateTime.UtcNow - _startTime;

            var byEndpoint = _metrics.PerRouteCounts
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new { name = kv.Key, count = kv.Value })
                .ToList();

            return Ok(new
            {
                endpoints = endpointsCount,
                users,
                requestsToday = _metrics.RequestsTotal,
                errorRate = _metrics.ErrorRatePercent,
                avgLatencyMs = _metrics.AvgLatencyMs,
                uptime = $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m",
                activeSessions = 0,
                trafficSpark = _metrics.LastTrafficPoints,
                byEndpoint
            });
        }
    }
}
