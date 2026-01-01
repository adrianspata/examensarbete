import type { ProductSummary } from "../api";

interface ProductsTableProps {
  products: ProductSummary[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
}

export function ProductsTable({
  products,
  loading,
  error,
  onReload,
}: ProductsTableProps) {
  return (
    <section
      style={{
        padding: "1.5rem",
        borderRadius: "0.75rem",
        background: "rgba(15,23,42,0.85)",
        border: "1px solid rgba(148,163,184,0.4)",
        marginTop: "1.5rem",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Products snapshot</h2>
          <p style={{ margin: 0, marginTop: "0.25rem", color: "#9ca3af" }}>
            Data hämtas från tabellen <code>products</code> i den lokala
            databasen.
          </p>
        </div>
        <button
          type="button"
          onClick={onReload}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "#e5e7eb",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </header>

      {loading && <p>Laddar produkter...</p>}

      {error && (
        <p style={{ color: "#f97373" }}>Kunde inte ladda produkter: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p style={{ color: "#9ca3af" }}>Inga produkter seedade ännu.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "0.5rem",
            border: "1px solid rgba(55,65,81,0.9)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead
              style={{
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #111827" }}>
                  <td style={tdStyle}>{p.id}</td>
                  <td style={tdStyle}>{p.sku}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={tdStyle}>
                    {(p.priceCents / 100).toFixed(2)} kr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid #1f2937",
  fontWeight: 500,
  color: "#9ca3af",
};

const tdStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem",
  color: "#e5e7eb",
};
