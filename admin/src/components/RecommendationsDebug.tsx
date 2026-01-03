import React, { useEffect, useState } from "react";
import {
  listProducts,
  previewRecommendations,
  type Product,
  type Recommendation,
} from "../api";

const DEFAULT_SESSION_ID = "demo-session";

const RecommendationsDebug: React.FC = () => {
  const [sessionId, setSessionId] = useState(DEFAULT_SESSION_ID);
  const [limit, setLimit] = useState(4);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hämta produkter en gång (för kontext)
  useEffect(() => {
    let isMounted = true;
    setProductsLoading(true);
    setProductsError(null);

    listProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setProductsError(
          err instanceof Error ? err.message : "Kunde inte ladda produkter"
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setProductsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await previewRecommendations(sessionId, limit);
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte hämta rekommendationer"
      );
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-recommendations">
      <div className="panel-body">
        <form className="reco-form" onSubmit={handlePreview}>
          <div className="reco-form-group">
            <label className="reco-label" htmlFor="session-id">
              Session ID
            </label>
            <input
              id="session-id"
              className="reco-input"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="t.ex. demo-session"
            />
          </div>

          <div className="reco-form-group">
            <label className="reco-label" htmlFor="limit">
              Max antal
            </label>
            <input
              id="limit"
              className="reco-input"
              type="number"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 1)}
            />
          </div>

          <div className="reco-form-group">
            <span className="reco-label">&nbsp;</span>
            <button
              type="submit"
              className="reco-button"
              disabled={loading}
            >
              {loading ? "Hämtar..." : "Förhandsvisa"}
            </button>
          </div>
        </form>

        <div className="reco-meta">
          <h3 className="reco-meta-title">Katalogstatus</h3>
          {productsLoading && (
            <p className="panel-state">Laddar produkter för sammanfattning…</p>
          )}
          {productsError && (
            <p className="panel-error">Fel vid produktladdning: {productsError}</p>
          )}
          {!productsLoading && !productsError && (
            <dl className="reco-meta-row">
              <dt>Antal produkter</dt>
              <dd>{products.length}</dd>
            </dl>
          )}
        </div>

        {error && <div className="panel-error">{error}</div>}

        {recommendations.length === 0 && !loading && !error && (
          <div className="panel-state">
            Inga rekommendationer ännu. Kör en förhandsvisning med knappen
            ovan.
          </div>
        )}

        {recommendations.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Namn</th>
                <th>Kategori</th>
                <th>Score</th>
                <th>Orsak</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.productId}>
                  <td>{rec.productId}</td>
                  <td>{rec.product.sku}</td>
                  <td>{rec.product.name}</td>
                  <td>{rec.product.category ?? "–"}</td>
                  <td>{rec.score.toFixed(2)}</td>
                  <td>{rec.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecommendationsDebug;
