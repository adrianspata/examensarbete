import { useEffect, useState } from "react";
import {
  fetchHealth,
  fetchProducts,
  type HealthResponse,
  type ProductSummary,
} from "./api";
import { ProductsTable } from "./components/ProductsTable";

type LoadState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthState, setHealthState] = useState<LoadState>("idle");
  const [healthError, setHealthError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productsState, setProductsState] = useState<LoadState>("idle");
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHealth() {
      setHealthState("loading");
      setHealthError(null);

      try {
        const data = await fetchHealth();
        if (!active) return;
        setHealth(data);
        setHealthState("success");
      } catch (err) {
        if (!active) return;
        setHealthError(err instanceof Error ? err.message : "Unknown error");
        setHealthState("error");
      }
    }

    loadHealth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    reloadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reloadProducts() {
    setProductsState("loading");
    setProductsError(null);

    try {
      const data = await fetchProducts();
      setProducts(data);
      setProductsState("success");
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "Unknown error");
      setProductsState("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#020617",
        color: "#e5e7eb",
        padding: "2rem",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>
          PPFE Admin – System Overview
        </h1>
        <p style={{ marginTop: "0.5rem", color: "#9ca3af" }}>
          Minimal adminpanel för att övervaka backendstatus och se en snapshot av
          produktdatan.
        </p>
      </header>

      <main style={{ maxWidth: "960px" }}>
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

          {healthState === "loading" && <p>Kontrollerar backend...</p>}

          {healthState === "error" && (
            <p style={{ color: "#f97373" }}>
              Kunde inte nå backend: {healthError ?? "okänt fel"}
            </p>
          )}

          {healthState === "success" && health && (
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

          {healthState === "idle" && <p>Ingen förfrågan skickad ännu.</p>}
        </section>

        <ProductsTable
          products={products}
          loading={productsState === "loading"}
          error={productsError}
          onReload={reloadProducts}
        />
      </main>
    </div>
  );
}
