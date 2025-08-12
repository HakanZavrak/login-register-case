import { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Protected() {
  const [msg, setMsg] = useState("Yükleniyor...");
  const useMock = import.meta.env.VITE_USE_MOCK === "1";

  useEffect(() => {
    (async () => {
      if (useMock) {
        setMsg("Protected sayfası mock ile gelebildik.");
      } else {
        const res = await http.get("/me");
        setMsg(`Merhaba ${res.data?.email || "hakan"}!`);
      }
    })();
  }, [useMock]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Protected Page</h1>
      <p>{msg}</p>
    </main>
  );
}
