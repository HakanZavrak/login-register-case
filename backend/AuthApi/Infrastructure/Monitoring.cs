using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection; // <-- EKLENDİ
using System.Threading.Tasks;

namespace AuthApi.Infrastructure
{
    public static class MonitoringExtensions
    {
        public static IApplicationBuilder UseRequestMonitoring(this IApplicationBuilder app, ILogger logger)
        {
            return app.Use(async (ctx, next) =>
            {
                var sw = Stopwatch.StartNew();
                var method = ctx.Request.Method;
                var path = ctx.Request.Path.ToString();

                try
                {
                    await next.Invoke();
                }
                finally
                {
                    sw.Stop();
                    var ms = sw.Elapsed.TotalMilliseconds;
                    var status = ctx.Response.StatusCode;

                    // mevcut log
                    logger.LogInformation("[HTTP] {Method} {Path} -> {Status} in {Elapsed} ms",
                        method, path, status, ms);

                    // metrics güncelle
                    var metrics = ctx.RequestServices.GetRequiredService<AppMetrics>();
                    metrics.AddRequest(path, status, ms);
                }
            });
        }
    }
}
