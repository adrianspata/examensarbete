import { useEffect, useState } from "react";
import { getRecommendations, type Product } from "../api";

export default function RecommendationsDebug() {
  const [sessionId] = useState("demo-session");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(sessionId)
      .then((data) => setItems(data.recommendations))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recommendations (debug)</div>
        <div className="card-meta">sessionId: {sessionId}</div>
      </div>

      {loading ? (
        <div className="card-meta">Fetching recommendations…</div>
      ) : items.length === 0 ? (
        <div className="card-meta">No recommendations yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className="card-meta">{p.sku}</td>
                <td>{p.name}</td>
                <td><span className="pill">{p.category}</span></td>
                <td>{(p.priceCents / 100).toFixed(2)} SEK</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
