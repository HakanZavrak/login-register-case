import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { Location } from "react-router-dom";
import { http } from "../api/http";
import { setToken } from "../Utilities/auth";
import axios from "axios";

interface LocationState { from?: Location; }

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: LocationState };
  const from = location.state?.from?.pathname || "/protected";

  const useMock = import.meta.env.VITE_USE_MOCK === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@")) return setErr("Geçerli bir e-posta girin.");
    if (password.length < 6) return setErr("Şifre en az 6 karakter olmalı.");
    try {
      if (useMock) {
        setToken("dev-mock-token");
      } else {
        const res = await http.post("/auth/login", { email, password });
        setToken(res.data?.token);
      }
      navigate(from, { replace: true });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) setErr(e.response?.data?.message || "Giriş başarısız.");
      else setErr("Giriş başarısız.");
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input type="email" placeholder="email@example.com" value={email}
               onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Şifre" value={password}
               onChange={(e) => setPassword(e.target.value)} />
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Giriş Yap</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
      </p>
    </main>
  );
}
