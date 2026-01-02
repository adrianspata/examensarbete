import { useEffect, useState } from "react";
import { listProducts, type Product } from "../api";

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts()
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Products</div>
        <div className="card-meta">{loading ? "Loading..." : `${products.length} items`}</div>
      </div>

      {loading ? (
        <div className="card-meta">Fetching products…</div>
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
            {products.map((p) => (
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
