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

const PLACEHOLDER: Metrics = {
  endpoints: 0,
  users: 0,
  requestsToday: 0,
  errorRate: 0,
  avgLatencyMs: 0,
  uptime: "0m",
  activeSessions: 0,
  trafficSpark: [0, 0],
  byEndpoint: [],
};

export default function Protected() {
  const [msg, setMsg] = useState("Loading...");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const me = await http.get("/me");
        if (!alive) return;
        setMsg(`Hello ${me.data?.email ?? "user"}!`);
        const m = await http.get<Metrics>("/metrics/summary");
        if (!alive) return;
        setMetrics(m.data);
  } catch (err) {
  console.error("Failed to load metrics:", err);
  if (!alive) return;
  setMsg("Unauthorized or session expired.");
}
 finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const m = metrics ?? PLACEHOLDER;

  const sparkPath = useMemo(() => {
    const vals = (m.trafficSpark?.length ?? 0) > 1 ? m.trafficSpark : [0, 0];
    const w = 220, h = 60, pad = 6;
    const max = Math.max(...vals, 1);
    const step = (w - pad * 2) / (vals.length - 1);
    const points = vals.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [m.trafficSpark]);

  const maxEndpoint = useMemo(
    () => Math.max(...(m.byEndpoint?.map((e) => e.count) ?? [1]), 1),
    [m.byEndpoint]
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

          {loading && (
            <div className="text-sm text-gray-500 mb-4">Loading metrics…</div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Endpoints" value={m.endpoints} />
            <StatCard label="Users" value={m.users} />
            <StatCard label="Requests (Today)" value={m.requestsToday} />
            <StatCard
              label="Error Rate"
              value={`${(m.errorRate ?? 0).toFixed(1)}%`}
              badge={(m.errorRate ?? 0) < 1 ? "Good" : "High"}
            />
            <StatCard label="Avg Latency" value={`${m.avgLatencyMs} ms`} />
            <StatCard label="Uptime" value={m.uptime} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Traffic (last 12h)</h3>
                <span className="text-sm text-gray-500">req/min</span>
              </div>

              <div className="flex items-end gap-4">
                <svg viewBox="0 0 220 60" className="w-full h-16">
                  <path d={sparkPath} fill="none" stroke="currentColor" className="text-gray-900/70" strokeWidth="2" />
                  <path d={`${sparkPath} L 214,54 L 6,54 Z`} className="text-gray-900/10" fill="currentColor" />
                </svg>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {m.requestsToday.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">today</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Requests by Endpoint</h3>
              <div className="space-y-3">
                {(m.byEndpoint ?? []).map((e) => (
                  <div key={e.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate max-w-[60%]">{e.name}</span>
                      <span className="text-gray-500">{e.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900/80"
                        style={{ width: `${Math.max(6, (e.count / maxEndpoint) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(m.byEndpoint ?? []).length === 0 && (
                  <div className="text-sm text-gray-500">No data yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3">Session & Health</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <span className="font-medium">{m.activeSessions}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Avg Latency</span>
                  <span className="font-medium">{m.avgLatencyMs} ms</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Error Rate</span>
                  <span className={`font-medium ${m.errorRate < 1 ? "text-emerald-600" : "text-rose-600"}`}>
                    {m.errorRate}%
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Uptime</span>
                  <span className="font-medium">{m.uptime}</span>
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
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{badge}</span>
        )}
      </div>
    </div>
  );
}
