import React, { useEffect, useState } from "react";
import { listProducts, type Product } from "../api";

const ProductsTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    listProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Kunde inte ladda produkter"
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Products</h2>
        <p className="panel-subtitle">
          Aktuell produktkatalog hämtad från backend <code>/products</code>.
        </p>
      </div>

      <div className="panel-body">
        {loading && <p className="panel-state">Laddar produkter…</p>}
        {error && <p className="panel-error">Fel: {error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="panel-state">Inga produkter hittades.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Namn</th>
                <th>Kategori</th>
                <th>Pris</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category ?? "–"}</td>
                  <td>{p.price != null ? `${p.price.toFixed(2)} kr` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default ProductsTable;
