import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const navigate = useNavigate();
  const useMock = import.meta.env.VITE_USE_MOCK === "1";

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
      if (useMock) {
        setOk("Kayıt başarılı. Şimdi giriş yapabilirsin.");
        setTimeout(() => navigate("/login"), 800);
      } else {
        await http.post("/auth/register", { email, password });
        setOk("Kayıt başarılı. Şimdi giriş yapabilirsin.");
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) setErr(e.response?.data?.message || "Kayıt başarısız.");
      else setErr("Kayıt başarısız.");
    }
  }

  return (
    <main className="auth-card">
      <h1>Register</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%" }}
        />

        <ul className="rules">
          <li className={rules.hasMin ? "ok" : "bad"}>En az 6 karakter</li>
          <li className={rules.hasUpper ? "ok" : "bad"}>En az 1 büyük harf</li>
          <li className={rules.hasLower ? "ok" : "bad"}>En az 1 küçük harf</li>
          <li className={rules.hasDigit ? "ok" : "bad"}>En az 1 rakam</li>
          <li className={rules.hasSpecial ? "ok" : "bad"}>En az 1 özel karakter (. ! @ # $ % ^ & *)</li>
        </ul>

        <input
          type="password"
          placeholder="Password confirm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%" }}
        />

        <div className="form-msg">{err || (ok ? <span style={{ color: "green" }}>{ok}</span> : null)}</div>

        <button type="submit" style={{ width: "100%" }}>
          Kayıt Ol
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
      </p>
    </main>
  );
}
