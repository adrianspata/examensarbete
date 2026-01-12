import { useEffect, useState } from "react";
import {
  listProducts,
  sendEvent,
  getRecommendations,
  type Product,
  type EventPayload,
} from "./api";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "demo-session";

  const KEY = "ppfe_session_id";
  let existing = window.localStorage.getItem(KEY);
  if (!existing) {
    const random =
      "sess_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    window.localStorage.setItem(KEY, random);
    existing = random;
  }
  return existing;
}

export default function Storefront() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingReco, setLoadingReco] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init: skapa session + hämta produkter + första rekommendationer
  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);

    async function init() {
      setLoadingProducts(true);
      setError(null);
      try {
        const items = await listProducts();
        setProducts(items);

        // Skicka view-events för de första produkterna som visas (view)
        // endast en gång per session (undvika dubletter)
        if (typeof window !== "undefined") {
          const storageKey = `ppfe_initial_views_sent_${sid}`;
          const alreadySent = window.localStorage.getItem(storageKey);

          if (!alreadySent) {
            const viewed = items.slice(0, 8);
            viewed.forEach((product) => {
              const payload: EventPayload = {
                sessionId: sid,
                productId: product.id,
                eventType: "view",
                metadata: {
                  source: "test-storefront",
                  kind: "initial_view",
                },
              };
              void sendEvent(payload);
            });

            window.localStorage.setItem(storageKey, "1");
          }
        }

        // Direkt första rekommendationer baserat på sessionen
        setLoadingReco(true);
        try {
          const { items: recos } = await getRecommendations({
            sessionId: sid,
            limit: 8,
          });
          setRecommended(recos);
        } finally {
          setLoadingReco(false);
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Kunde inte hämta produkter."
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    void init();
  }, []);

  async function handleProductClick(product: Product) {
    if (!sessionId) return;

    const payload: EventPayload = {
      sessionId,
      productId: product.id,
      eventType: "click",
      metadata: {
        source: "test-storefront",
      },
    };

    // skicka click-event
    void sendEvent(payload);

    // uppdatera rekommendationer baserat på produkt klick
    setLoadingReco(true);
    try {
      const { items: recos } = await getRecommendations({
        sessionId,
        currentProductId: product.id,
        limit: 8,
      });
      setRecommended(recos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReco(false);
    }
  }

  async function handleAddToCart(product: Product) {
    if (!sessionId) return;

    const payload: EventPayload = {
      sessionId,
      productId: product.id,
      eventType: "add_to_cart",
      metadata: {
        source: "test-storefront",
        action: "add_to_cart",
      },
    };

    // skicka add to cart event
    void sendEvent(payload);

    // uppdatera rekommendationer baserat på produkten
    setLoadingReco(true);
    try {
      const { items: recos } = await getRecommendations({
        sessionId,
        currentProductId: product.id,
        limit: 8,
      });
      setRecommended(recos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReco(false);
    }
  }

  async function handleReload() {
    if (!sessionId) return;

    setLoadingProducts(true);
    setError(null);
    try {
      const items = await listProducts();
      setProducts(items);

      setLoadingReco(true);
      const { items: recos } = await getRecommendations({
        sessionId,
        limit: 8,
      });
      setRecommended(recos);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Kunde inte uppdatera produkter."
      );
    } finally {
      setLoadingProducts(false);
      setLoadingReco(false);
    }
  }

  return (
    <div className="storefront-page">
      <header className="storefront-header">
        <h1 className="storefront-title">PPFE Demo Storefront</h1>
        <p className="storefront-subtitle">
          Enkel demobutik för att testa den personaliserade produktfeed-motorn.
        </p>
        <div className="storefront-header-actions">
          <button
            type="button"
            className="storefront-button"
            onClick={handleReload}
            disabled={loadingProducts}
          >
            {loadingProducts
              ? "Uppdaterar..."
              : "Ladda om produkter & rekommendationer"}
          </button>
          {sessionId && (
            <span className="storefront-session">
              Session: <code>{sessionId}</code>
            </span>
          )}
        </div>
      </header>

      {error && <div className="storefront-error">Fel: {error}</div>}

      <div className="storefront-layout">
        <section className="storefront-section storefront-products">
          <h2 className="storefront-section-title">Alla produkter</h2>

          {loadingProducts && products.length === 0 ? (
            <div className="storefront-state">Hämtar produkter...</div>
          ) : products.length === 0 ? (
            <div className="storefront-state">
              Inga produkter att visa. Kontrollera seed-skriptet.
            </div>
          ) : (
            <div className="storefront-grid">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image-wrapper">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image-fallback">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="product-meta">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-sku">SKU: {product.sku}</p>
                    <p className="product-category">
                      {product.category ?? "Okänd kategori"}
                    </p>
                    <p className="product-price">
                      {product.price != null
                        ? `${product.price.toFixed(2)} kr`
                        : "Pris saknas"}
                    </p>
                  </div>
                  <div className="product-actions">
                    <button
                      type="button"
                      className="product-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleProductClick(product);
                      }}
                    >
                      Click (event)
                    </button>

                    <button
                      type="button"
                      className="product-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleAddToCart(product);
                      }}
                    >
                      Add to cart (event)
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="storefront-section storefront-recommended">
          <h2 className="storefront-section-title">Rekommenderat för dig</h2>

          {loadingReco && (
            <div className="storefront-state">
              Beräknar rekommendationer...
            </div>
          )}

          {!loadingReco && recommended.length === 0 && (
            <div className="storefront-state">
              Inga rekommendationer ännu. Klicka runt på några produkter för att
              generera event.
            </div>
          )}

          {!loadingReco && recommended.length > 0 && (
            <ul className="storefront-reco-list">
              {recommended.map((product) => (
                <li key={product.id} className="storefront-reco-item">
                  <div className="reco-main">
                    <span className="reco-name">{product.name}</span>
                    <span className="reco-sku">({product.sku})</span>
                  </div>
                  <div className="reco-meta">
                    <span className="reco-category">
                      {product.category ?? "Okänd kategori"}
                    </span>
                    <span className="reco-price">
                      {product.price != null
                        ? `${product.price.toFixed(2)} kr`
                        : "Pris saknas"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
