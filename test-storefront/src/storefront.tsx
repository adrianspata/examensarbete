import { useEffect, useMemo, useState } from "react";
import { listProducts, sendEvent, type Product } from "./api";

function getSessionId(): string {
  const key = "ppfe_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(key, id);
  return id;
}

export default function Storefront() {
  const sessionId = useMemo(() => getSessionId(), []);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    listProducts()
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  function onProductClick(p: Product) {
    void sendEvent({ sessionId, productId: p.id, eventType: "product_click" });
  }

  return (
    <div className="sf-shell">
      <header className="sf-topbar">
        <div className="sf-topbar-inner">
          <div className="sf-brand">
            PPFE <small>Retail Demo</small>
          </div>
          <button
            type="button"
            className="sf-btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            Theme: {theme}
          </button>
        </div>
      </header>

      <main className="sf-container">
        <section className="sf-hero">
          <div className="sf-hero-card">
            <h1 className="sf-hero-title">Sneakers & Essentials</h1>
            <p className="sf-hero-sub">
              Minimal storefront used to generate interaction events for the recommendation engine.
              Click products to create events. Recommendations are debugged in the admin panel.
            </p>
          </div>
          <div className="sf-hero-card">
            <div className="product-meta">
              <span className="pill">session</span>
              <span className="product-price">{sessionId}</span>
            </div>
            <div className="product-meta product-meta-spaced">
              <span className="pill">catalog</span>
              <span className="product-price">{loading ? "…" : `${products.length} products`}</span>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="sf-empty">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="sf-empty">No products found. Seed the database.</div>
        ) : (
          <section className="sf-grid">
            {products.map((p) => (
              <article key={p.id} className="product-card" onClick={() => onProductClick(p)}>
                <div className="product-media">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                </div>
                <div className="product-body">
                  <h3 className="product-name">{p.name}</h3>
                  <div className="product-meta">
                    <span className="pill">{p.category}</span>
                    <span className="product-price">{(p.priceCents / 100).toFixed(2)} SEK</span>
                  </div>
                  <div className="product-meta">
                    <span>{p.sku}</span>
                    <button type="button" className="sf-btn sf-btn-accent">
                      View
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
