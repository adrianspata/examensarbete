import React, { useEffect, useState } from "react";
import { listEvents, type EventRow } from "../api";

const EventsTable: React.FC = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    listEvents()
      .then((rows) => {
        if (!isMounted) return;
        setEvents(rows);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Kunde inte ladda events"
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
        <h2 className="panel-title">Events</h2>
        <p className="panel-subtitle">
          Senaste interaktioner från storefront (view / click / add_to_cart).
        </p>
      </div>

      <div className="panel-body">
        {loading && <p className="panel-state">Laddar events…</p>}
        {error && <p className="panel-error">Fel: {error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="panel-state">Inga events registrerade ännu.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Session</th>
                <th>Användare</th>
                <th>Typ</th>
                <th>Produkt</th>
                <th>SKU</th>
                <th>Skapad</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.sessionId}</td>
                  <td>{e.userId ?? "–"}</td>
                  <td>{e.eventType}</td>
                  <td>{e.productName ?? "–"}</td>
                  <td>{e.productSku ?? "–"}</td>
                  <td>{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default EventsTable;
