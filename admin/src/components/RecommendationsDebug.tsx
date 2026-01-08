import React, { useState } from "react";
import {
  fetchRecommendationsPreview,
  type RecommendationsPreviewItem,
  type RecommendationsPreviewDebug,
} from "../api";

const RecommendationsDebug: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const [currentProductId, setCurrentProductId] = useState<string>("");
  const [items, setItems] = useState<RecommendationsPreviewItem[]>([]);
  const [debug, setDebug] = useState<RecommendationsPreviewDebug | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRecommendationsPreview({
        sessionId: sessionId.trim() || undefined,
        currentProductId: currentProductId
          ? Number.parseInt(currentProductId, 10)
          : undefined,
        limit: 8,
      });

      if (!result.ok) {
        setError(result as unknown as string);
        setItems([]);
        setDebug(null);
        return;
      }

      setItems(result.items ?? []);
      setDebug(result.debug ?? null);
    } catch (err) {
      setItems([]);
      setDebug(null);
      setError(
        err instanceof Error ? err.message : "Kunde inte hämta rekommendationer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rec-debug">
      <div className="rec-debug-controls">
        <div className="rec-debug-row">
          <label>
            Session ID
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="t.ex. sess_123..."
            />
          </label>
          <label>
            Current product ID
            <input
              type="number"
              value={currentProductId}
              onChange={(e) => setCurrentProductId(e.target.value)}
              placeholder="valfritt"
              min={1}
            />
          </label>
          <button type="button" onClick={handleRun} disabled={loading}>
            {loading ? "Laddar..." : "Ladda rekommendationer"}
          </button>
        </div>
      </div>

      {error && <p className="admin-error">⚠️ {error}</p>}

      {items.length > 0 && (
        <div className="rec-grid">
          {items.map((item) => (
            <article key={item.id} className="rec-card">
              <div className="rec-card-main">
                <h3>{item.name}</h3>
                <p className="rec-card-sku">{item.sku}</p>
                {item.category && (
                  <p className="rec-card-category">{item.category}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {items.length === 0 && !loading && !error && (
        <p className="admin-empty">
          Inga rekommendationer att visa ännu – kör en sökning ovan.
        </p>
      )}

      {debug && (
        <div className="rec-debug-meta">
          <h3>Debug-info</h3>
          <ul>
            <li>
              <strong>Strategy:</strong> {debug.strategy}
            </li>
            <li>
              <strong>Session:</strong> {debug.sessionId ?? "–"}
            </li>
            <li>
              <strong>Current product ID:</strong>{" "}
              {debug.currentProductId ?? "–"}
            </li>
            <li>
              <strong>Limit:</strong> {debug.limit}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecommendationsDebug;
