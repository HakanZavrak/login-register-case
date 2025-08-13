import { useEffect, useState } from "react";
import { http } from "../api/http";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Protected() {
  const [msg, setMsg] = useState("Loading...");

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 grid place-items-center px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Protected Page
          </h1>
          <p className="text-gray-600">{msg}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
