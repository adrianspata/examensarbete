import { useEffect, useState } from "react";
import { fetchHealth, type HealthResponse } from "./api";

type LoadState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      setError(null);

      try {
        const data = await fetchHealth();
        if (!active) return;
        setHealth(data);
        setState("success");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setState("error");
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#0f172a",
        color: "#e5e7eb",
        padding: "2rem",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>
          PPFE Admin – System Overview
        </h1>
        <p style={{ marginTop: "0.5rem", color: "#9ca3af" }}>
          Minimal adminpanel för att övervaka backendstatus och senare events/rekommendationer.
        </p>
      </header>

      <main>
        <section
          style={{
            padding: "1.5rem",
            borderRadius: "0.75rem",
            background:
              "linear-gradient(135deg, rgba(15,118,110,0.35), rgba(30,64,175,0.35))",
            border: "1px solid rgba(148,163,184,0.35)",
            maxWidth: "480px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.1rem" }}>
            Backend health
          </h2>

          {state === "loading" && <p>Kontrollerar backend...</p>}

          {state === "error" && (
            <p style={{ color: "#f97373" }}>
              Kunde inte nå backend: {error ?? "okänt fel"}
            </p>
          )}

          {state === "success" && health && (
            <div style={{ display: "grid", rowGap: "0.25rem", fontSize: "0.95rem" }}>
              <div>
                <span style={{ color: "#9ca3af" }}>Status: </span>
                <span
                  style={{
                    color: health.status === "ok" ? "#4ade80" : "#fbbf24",
                    fontWeight: 600,
                  }}
                >
                  {health.status}
                </span>
              </div>
              <div>
                <span style={{ color: "#9ca3af" }}>Service: </span>
                <span>{health.service}</span>
              </div>
            </div>
          )}

          {state === "idle" && <p>Ingen förfrågan skickad ännu.</p>}
        </section>
      </main>
    </div>
  );
}
