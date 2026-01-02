import { useEffect, useState } from "react";
import { listEvents, type AdminEvent } from "../api";

export default function EventsTable() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then((data) => setEvents(data.events))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Event log</div>
        <div className="card-meta">{loading ? "Loading..." : `${events.length} rows`}</div>
      </div>

      {loading ? (
        <div className="card-meta">Fetching events…</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Session</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td><span className="pill">{e.eventType}</span></td>
                <td>{e.productName}</td>
                <td>{e.productSku}</td>
                <td className="card-meta">{e.sessionId}</td>
                <td className="card-meta">{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
