import { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Protected() {
  const [msg, setMsg] = useState("Yükleniyor...");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await http.get("/me");
        if (!alive) return;
        setMsg(`Merhaba ${data?.email ?? "kullanıcı"}!`);
      } catch {
        if (!alive) return;
        setMsg("Yetkisiz veya oturum süresi doldu.");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="auth-card">
      <h1>Protected Page</h1>
      <p>{msg}</p>
    </main>
  );
}
