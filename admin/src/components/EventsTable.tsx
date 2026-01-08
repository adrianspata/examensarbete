import React, { useEffect, useState } from "react";
import { listEvents, type EventRow } from "../api";

const EventsTable: React.FC = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listEvents()
      .then((rows) => {
        if (!isMounted) return;
        setEvents(rows);
        setError(null);
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

  if (loading) {
    return <p>Laddar events…</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!events.length) {
    return <p>Inga events hittades.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Tid</th>
            <th>Session</th>
            <th>Typ</th>
            <th>Produkt</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>{e.session_id}</td>
              <td>{e.event_type}</td>
              <td>
                {e.product_sku
                  ? `${e.product_name ?? "Okänd"} (${e.product_sku})`
                  : "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
