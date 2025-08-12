import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = useMemo(() => {
    const hasMin = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[.!@#$%^&*]/.test(password);
    return { hasMin, hasUpper, hasLower, hasDigit, hasSpecial };
  }, [password]);

  function allRulesOk() {
    const { hasMin, hasUpper, hasLower, hasDigit, hasSpecial } = rules;
    return hasMin && hasUpper && hasLower && hasDigit && hasSpecial;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!emailRegex.test(email)) return setErr("Geçerli bir e-posta girin.");
    if (!allRulesOk()) return setErr("Şifre kurallarını tamamlayın.");
    if (password !== confirmPassword) return setErr("Şifreler eşleşmiyor.");

    try {
      await http.post("/auth/register", { email, password });
      setOk("Kayıt başarılı. Şimdi giriş yapabilirsin.");
      setTimeout(() => navigate("/login"), 800);
    } 
    catch (e: unknown) {
      if (axios.isAxiosError(e)) setErr(e.response?.data?.message ?? "Kayıt başarısız.");
      else setErr("Kayıt başarısız.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 grid lg:grid-cols-2">
      <aside
        className="hidden lg:block bg-cover bg-center order-last lg:order-first"
      >
        <div className="h-full w-full bg-black/50 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Join Us</h2>
            <p className="text-lg opacity-90">
              Get started with your account and explore more.
            </p>
          </div>
        </div>
      </aside>

      <main
        className={[
          "w-full flex items-center justify-center p-6 sm:p-8",
          "transform transition-all duration-500 ease-out",
          mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        ].join(" ")}
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
              <p className="text-gray-600 mt-1">Get started with your account</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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

              <ul className="grid gap-1.5 text-sm">
                <Rule ok={rules.hasMin}>At least 6 characters</Rule>
                <Rule ok={rules.hasUpper}>At least 1 uppercase letter</Rule>
                <Rule ok={rules.hasLower}>At least 1 lowercase letter</Rule>
                <Rule ok={rules.hasDigit}>At least 1 number</Rule>
                <Rule ok={rules.hasSpecial}>At least 1 special character (. ! @ # $ % ^ & *)</Rule>
              </ul>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    placeholder="Password confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-16 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    aria-pressed={showConfirmPwd}
                    className="absolute inset-y-0 right-2 my-1 px-3 rounded-md text-xs font-medium
                               text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {showConfirmPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="min-h-5 text-sm">
                {err && <span className="text-red-600">{err}</span>}
                {!err && ok && <span className="text-green-600">{ok}</span>}
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/50 transition-colors"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600">
              Already had an account?{" "}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={ok ? "text-green-600" : "text-gray-500"}>
      <span className="inline-block w-4">{ok ? "✓" : "•"}</span>
      <span>{children}</span>
    </li>
  );
}
