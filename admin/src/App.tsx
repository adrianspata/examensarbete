import React, { useEffect, useState } from "react";
import { fetchHealth } from "./api";
import ProductsTable from "./components/ProductsTable";
import EventsTable from "./components/EventsTable";
import RecommendationsDebug from "./components/RecommendationsDebug";

type Tab = "products" | "events" | "recommendations";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [health, setHealth] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchHealth()
      .then((status) => {
        if (!isMounted) return;
        setHealth(status);
        setHealthError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setHealthError(err instanceof Error ? err.message : "Okänt fel");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header-main">
          <div>
            <h1 className="admin-title">PPFE Admin</h1>
            <p className="admin-subtitle">
              Minimal kontrollpanel för produkter, events och rekommendationer.
            </p>
          </div>
          <div className="admin-badge">Local dev</div>
        </div>

        <div className="admin-header-meta">
          {health && !healthError && (
            <span className="admin-health admin-health--ok">
              Backend: {health}
            </span>
          )}
          {healthError && (
            <span className="admin-health admin-health--error">
              Backend-fel: {healthError}
            </span>
          )}
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
