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

    setHealth(null);
    setHealthError(null);

    fetchHealth()
      .then((data) => {
        if (!isMounted) return;
        setHealth(data);
        setHealthError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setHealth(null);
        setHealthError(
          err instanceof Error ? err.message : "Unknown error from backend"
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  let healthLabel = "Checking backend…";
  let healthClass = "admin-health admin-health--loading";

  if (healthError) {
    healthLabel = "Backend error";
    healthClass = "admin-health admin-health--error";
  } else if (health && health.ok) {
    healthLabel = "Backend: OK";
    healthClass = "admin-health admin-health--ok";
  } else if (health && !health.ok) {
    healthLabel = "Backend: issues";
    healthClass = "admin-health admin-health--error";
  }

  const tabLabel =
    activeTab === "products"
      ? "Products"
      : activeTab === "events"
      ? "Events"
      : "Recommendations";


  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div>
            <div className="admin-brand-name">PPFE Admin</div>
            <div className="admin-brand-sub">Personalised Product Feed Engine</div>
          </div>
        </div>

        <nav className="admin-nav">
          <p className="admin-sidebar-section">Menu</p>
          <button
            type="button"
            className={
              "admin-nav-item" +
              (activeTab === "products" ? " admin-nav-item--active" : "")
            }
            onClick={() => setActiveTab("products")}
          >
            <span className="admin-nav-label">Products</span>
          </button>
          <button
            type="button"
            className={
              "admin-nav-item" +
              (activeTab === "events" ? " admin-nav-item--active" : "")
            }
            onClick={() => setActiveTab("events")}
          >
            <span className="admin-nav-label">Events</span>
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
            <span className="admin-nav-label">Recommendations</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <span className={healthClass}>{healthLabel}</span>
          {health && health.message && (
            <span className="admin-health-message">{health.message}</span>
          )}
          {healthError && (
            <span className="admin-health-message">{healthError}</span>
          )}
        </div>
      </aside>

      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">Dashboard / {tabLabel}</div>
            <h1 className="admin-title">Personalised Product Feed Engine</h1>
            <p className="admin-subtitle">
              Control panel for inspecting products, events and recommendations.
            </p>
          </div>
        </header>

        <main className="admin-main">
          {activeTab === "products" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Products</h2>
                  <p className="panel-subtitle">
                    Live product catalog from /products.
                  </p>
                </div>
              </div>
              <div className="panel-body">
                <ProductsTable />
              </div>
            </section>
          )}

          {activeTab === "events" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Events</h2>
                  <p className="panel-subtitle">
                    Interactions coming from the test storefront.
                  </p>
                </div>
              </div>
              <div className="panel-body">
                <EventsTable />
              </div>
            </section>
          )}

          {activeTab === "recommendations" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Recommendations</h2>
                  <p className="panel-subtitle">
                    Run the rule-based engine against different sessions and
                    contexts.
                  </p>
                </div>
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
