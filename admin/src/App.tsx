import React, { useEffect, useState } from "react";
import { fetchHealth } from "./api";
import ProductsTable from "./components/ProductsTable";
import EventsTable from "./components/EventsTable";
import RecommendationsDebug from "./components/RecommendationsDebug";
import "./styles/index.css";

type Tab = "products" | "events" | "recommendations";

interface HealthResponse {
  ok: boolean;
  message?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchHealth()
      .then((data) => {
        if (!isMounted) return;
        // förväntar oss t.ex. { ok: true, message?: string }
        setHealth(typeof data === "object" && data !== null ? data : null);
        setHealthError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setHealth(null);
        setHealthError(
          err instanceof Error ? err.message : "Okänt fel mot backend"
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  let healthLabel: string;
  let healthClass = "admin-health";

  if (healthError) {
    healthLabel = "Backend-fel";
    healthClass += " admin-health--error";
  } else if (!health) {
    healthLabel = "Kontrollerar backend…";
    healthClass += " admin-health--loading";
  } else if (health.ok) {
    healthLabel = "Backend: OK";
    healthClass += " admin-health--ok";
  } else {
    healthLabel = "Backend: problem";
    healthClass += " admin-health--error";
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header-main">
          <div>
            <h1 className="admin-title">Admin dashboard</h1>
            <p className="admin-subtitle">
              Kontrollpanel för produkter, events och
              rekommendationer.
            </p>
          </div>
        </div>

        <div className="admin-header-meta">
          <span className={healthClass}>
            {healthLabel}
            {health && health.message && (
              <span className="admin-health-message"> – {health.message}</span>
            )}
            {healthError && (
              <span className="admin-health-message">
                {" "}
                – {healthError}
              </span>
            )}
          </span>
        </div>
      </header>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-title">Views</p>
          <nav className="admin-nav">
            <button
              type="button"
              className={
                "admin-nav-item" +
                (activeTab === "products" ? " admin-nav-item--active" : "")
              }
              onClick={() => setActiveTab("products")}
            >
              <span>Products</span>
            </button>
            <button
              type="button"
              className={
                "admin-nav-item" +
                (activeTab === "events" ? " admin-nav-item--active" : "")
              }
              onClick={() => setActiveTab("events")}
            >
              <span>Events</span>
            </button>
            <button
              type="button"
              className={
                "admin-nav-item" +
                (activeTab === "recommendations"
                  ? " admin-nav-item--active"
                  : "")
              }
              onClick={() => setActiveTab("recommendations")}
            >
              <span>Recommendations</span>
            </button>
          </nav>
        </aside>

        <main className="admin-main">
          {activeTab === "products" && (
            <section className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Products</h2>
                <p className="panel-subtitle">
                  Aktuell produktkatalog hämtad från <code>/products</code>.
                </p>
              </div>
              <div className="panel-body">
                <ProductsTable />
              </div>
            </section>
          )}

          {activeTab === "events" && (
            <section className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Events</h2>
                <p className="panel-subtitle">
                  Senaste interaktioner från test-storefront.
                </p>
              </div>
              <div className="panel-body">
                <EventsTable />
              </div>
            </section>
          )}

          {activeTab === "recommendations" && (
            <section className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Recommendations</h2>
                <p className="panel-subtitle">
                  Testa den regelbaserade motorn mot olika sessioner.
                </p>
              </div>
              <div className="panel-body">
                <RecommendationsDebug />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
