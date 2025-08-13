import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Metrics = {
  endpoints: number;
  users: number;
  requestsToday: number;
  errorRate: number; // %
  avgLatencyMs: number;
  uptime: string;
  activeSessions: number;
  trafficSpark: number[]; 
  byEndpoint: { name: string; count: number }[];
};

const DUMMY_METRICS: Metrics = {
  endpoints: 18,
  users: 742,
  requestsToday: 12940,
  errorRate: 0.7,
  avgLatencyMs: 112,
  uptime: "99.97%",
  activeSessions: 56,
  trafficSpark: [24, 18, 30, 45, 40, 52, 60, 48, 35, 50, 62, 58],
  byEndpoint: [
    { name: "/api/auth/login", count: 3420 },
    { name: "/api/auth/register", count: 1280 },
    { name: "/api/me", count: 4980 },
    { name: "/api/users", count: 860 },
    { name: "/api/health", count: 2400 },
  ],
};

export default function Protected() {
  const [msg, setMsg] = useState("Loading...");
  const [metrics] = useState<Metrics>(DUMMY_METRICS);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await http.get("/me");
        if (!alive) return;
        setMsg(`Hello ${data?.email ?? "user"}!`);
      } catch {
        if (!alive) return;
        setMsg("Unauthorized or session expired.");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sparkPath = useMemo(() => {
    const w = 220;
    const h = 60;
    const pad = 6;
    const vals = metrics.trafficSpark;
    const max = Math.max(...vals) || 1;
    const step = (w - pad * 2) / (vals.length - 1);
    const points = vals.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [metrics.trafficSpark]);

  const maxEndpoint = useMemo(
    () => Math.max(...metrics.byEndpoint.map((e) => e.count), 1),
    [metrics.byEndpoint]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Protected Page
            </h1>
            <p className="text-gray-600">{msg}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Endpoints" value={metrics.endpoints} />
            <StatCard label="Users" value={metrics.users} />
            <StatCard label="Requests (Today)" value={metrics.requestsToday} />
            <StatCard
              label="Error Rate"
              value={`${metrics.errorRate.toFixed(1)}%`}
              badge={metrics.errorRate < 1 ? "Good" : "High"}
            />
            <StatCard label="Avg Latency" value={`${metrics.avgLatencyMs} ms`} />
            <StatCard label="Uptime" value={metrics.uptime} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  Traffic (last 12h)
                </h3>
                <span className="text-sm text-gray-500">req/min</span>
              </div>

              <div className="flex items-end gap-4">
                <svg viewBox="0 0 220 60" className="w-full h-16">
                  <path d={sparkPath} fill="none" stroke="currentColor" className="text-gray-900/70" strokeWidth="2" />
                  <path
                    d={`${sparkPath} L 214,54 L 6,54 Z`}
                    className="text-gray-900/10"
                    fill="currentColor"
                  />
                </svg>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.requestsToday.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">today</div>
                </div>
              </div>
            </div>


            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Requests by Endpoint
              </h3>
              <div className="space-y-3">
                {metrics.byEndpoint.map((e) => (
                  <div key={e.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate max-w-[60%]">
                        {e.name}
                      </span>
                      <span className="text-gray-500">{e.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900/80"
                        style={{
                          width: `${Math.max(6, (e.count / maxEndpoint) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3">Session & Health</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <span className="font-medium">{metrics.activeSessions}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Avg Latency</span>
                  <span className="font-medium">{metrics.avgLatencyMs} ms</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Error Rate</span>
                  <span className={`font-medium ${metrics.errorRate < 1 ? "text-emerald-600" : "text-rose-600"}`}>
                    {metrics.errorRate}%
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Uptime</span>
                  <span className="font-medium">{metrics.uptime}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: number | string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
