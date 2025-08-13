using System.Collections.Concurrent;

namespace AuthApi.Infrastructure
{
    public class AppMetrics
    {
        
        private long _requestsTotal;
        private long _errorsTotal;
        private double _totalLatencyMs;
        private readonly object _latencyLock = new();

        public long RequestsTotal => _requestsTotal;
        public long ErrorsTotal => _errorsTotal;
        public double AvgLatencyMs => _requestsTotal == 0 ? 0 : Math.Round(_totalLatencyMs / _requestsTotal, 2);
        public double ErrorRatePercent => _requestsTotal == 0 ? 0 : Math.Round((double)_errorsTotal / _requestsTotal * 100, 1);

        public ConcurrentDictionary<string, long> PerRouteCounts { get; } = new();

        private readonly Queue<int> _traffic = new();
        private readonly object _trafficLock = new();
        public int[] LastTrafficPoints { get { lock (_trafficLock) return _traffic.ToArray(); } }

        public void AddRequest(string route, int status, double elapsedMs)
        {
            Interlocked.Increment(ref _requestsTotal);
            if (status >= 500) Interlocked.Increment(ref _errorsTotal);
        
            lock (_latencyLock) { _totalLatencyMs += elapsedMs; }

            PerRouteCounts.AddOrUpdate(route, 1, (_, old) => old + 1);

            
            lock (_trafficLock)
            {
                _traffic.Enqueue(1);
                if (_traffic.Count > 12) _traffic.Dequeue();
            }
        }
    }
}
