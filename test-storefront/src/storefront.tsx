import { useEffect, useState } from "react";

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
}

type LoadState = "idle" | "loading" | "success" | "error";

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setState("loading");
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/products");
      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status}`);
      }
      const data = (await res.json()) as Product[];
      setProducts(data);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }

  return (
    <div className="sf-root">
      <header className="sf-header">
        <h1>E-commerce PPFE – Test Storefront</h1>
        <p>
          Enkel testbutik som visar produkter från backend. Senare kommer
          rekommendationsflödet integreras här.
        </p>
      </header>

      <main className="sf-main">
        <section className="sf-products-section">
          <div className="sf-products-header">
            <h2>All products</h2>
            <button type="button" onClick={loadProducts}>
              Reload
            </button>
          </div>

          {state === "loading" && <p>Loading products...</p>}

          {state === "error" && (
            <p className="sf-error">
              Could not load products: {error ?? "unknown error"}
            </p>
          )}

          {state === "success" && products.length === 0 && (
            <p>No products found. Did you run the seed script?</p>
          )}

          {state === "success" && products.length > 0 && (
            <div className="sf-grid">
              {products.map((p) => (
                <article key={p.id} className="sf-card">
                  <div className="sf-image-wrapper">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} />
                    ) : (
                      <div className="sf-image-placeholder">
                        <span>{p.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="sf-card-body">
                    <h3>{p.name}</h3>
                    <p className="sf-sku">{p.sku}</p>
                    <p className="sf-category">{p.category}</p>
                    <p className="sf-price">
                      {(p.priceCents / 100).toFixed(2)} kr
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
