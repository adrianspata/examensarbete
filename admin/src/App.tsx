import { useEffect, useMemo, useState } from "react";
import EventsTable from "./components/EventsTable";
import ProductsTable from "./components/ProductsTable";
import RecommendationsDebug from "./components/RecommendationsDebug";

type View = "products" | "events" | "recommendations";

export default function App() {
  const [view, setView] = useState<View>("products");

  const title = useMemo(() => {
    if (view === "products") return { h: "Products", s: "Catalog overview" };
    if (view === "events") return { h: "Events", s: "Interaction stream (latest 200)" };
    return { h: "Recommendations", s: "Rule output for debugging" };
  }, [view]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-badge" />
          <div>PPFE Admin</div>
        </div>

        <div className="card-meta">Minimal dashboard for debugging.</div>

        <div className="admin-nav">
          <div
            className={`nav-item ${view === "products" ? "nav-item-active" : ""}`}
            onClick={() => setView("products")}
          >
            <span>Products</span>
            <span className="pill">P</span>
          </div>

          <div
            className={`nav-item ${view === "events" ? "nav-item-active" : ""}`}
            onClick={() => setView("events")}
          >
            <span>Events</span>
            <span className="pill">E</span>
          </div>

          <div
            className={`nav-item ${view === "recommendations" ? "nav-item-active" : ""}`}
            onClick={() => setView("recommendations")}
          >
            <span>Recommendations</span>
            <span className="pill">R</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <div className="admin-title">{title.h}</div>
            <div className="admin-subtitle">{title.s}</div>
          </div>
        </div>

        <div className="admin-grid">
          {view === "products" && <ProductsTable />}
          {view === "events" && <EventsTable />}
          {view === "recommendations" && <RecommendationsDebug />}
        </div>
      </main>
    </div>
  );
}
