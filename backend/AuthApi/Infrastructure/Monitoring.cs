
using System.Diagnostics;
using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;

namespace AuthApi.Infrastructure;

public static class Monitoring
{
    private static readonly Meter Meter = new("AuthApi", "1.0.0");

    public static readonly Counter<long> RequestCount =
        Meter.CreateCounter<long>("http_requests_total");

    public static readonly Counter<long> ErrorCount =
        Meter.CreateCounter<long>("http_requests_errors_total");

    public static readonly Histogram<double> RequestDurationMs =
        Meter.CreateHistogram<double>("http_request_duration_ms");

    public static IApplicationBuilder UseRequestMonitoring(this IApplicationBuilder app, ILogger logger)
    {
        return app.Use(async (ctx, next) =>
        {
            var sw = Stopwatch.StartNew();
            try
            {
                await next();
            }
            finally
            {
                sw.Stop();
                var method = ctx.Request.Method;
                var path = ctx.Request.Path.ToString();
                var status = ctx.Response.StatusCode;
                var ms = sw.Elapsed.TotalMilliseconds;

                // Tek satır, okunaklı log
                logger.LogInformation("{method} {path} -> {status} {elapsed}ms",
                    method, path, status, (int)ms);

                var tags = new[]
                {
                    new KeyValuePair<string, object?>("method", method),
                    new KeyValuePair<string, object?>("route", path),
                    new KeyValuePair<string, object?>("status", status),
                };

                RequestCount.Add(1, tags);
                RequestDurationMs.Record(ms, tags);
                if (status >= 500) ErrorCount.Add(1, tags);
            }
        });
    }
}
