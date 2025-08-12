import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { Location } from "react-router-dom";
import { http } from "../api/http";
import { setToken } from "../Utilities/auth";
import axios from "axios";

interface LocationState { from?: Location; }

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: LocationState };
  const from = location.state?.from?.pathname || "/protected";

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Please enter a valid email address.");
    if (password.length < 6) return setErr("Password must be at least 6 characters long.");
    try {
      const { data } = await http.post("/auth/login", { email, password });
      if (!data?.token) return setErr("Login failed.");
      setToken(data.token);
      navigate(from, { replace: true });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) setErr(e.response?.data?.message ?? "Login failed.");
      else setErr("Login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 grid lg:grid-cols-2">
      <main
        className={[
          "w-full flex items-center justify-center p-6 sm:p-8",
          "transform transition-all duration-500 ease-out",
          mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        ].join(" ")}
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
              <p className="text-gray-600 mt-1">Please sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-16 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-pressed={showPwd}
                    className="absolute inset-y-0 right-2 my-1 px-3 rounded-md text-xs font-medium
                               text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {err && <div className="text-sm text-red-600">{err}</div>}

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/50 transition-colors"
              >
                Sign in
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <aside
        className="hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')",
        }}
      >
        <div className="h-full w-full bg-black/50 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Welcome</h2>
            <p className="text-lg opacity-90">
              Good to see you back
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
