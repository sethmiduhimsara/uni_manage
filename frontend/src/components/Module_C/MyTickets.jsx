import { useEffect, useState } from "react";
import "./user-ticket.css";
import SkeletonBlocks from "../common/SkeletonBlocks";

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  } catch {
    // Fall back to generic message when API body is not JSON.
  }
  return fallbackMessage;
}

function MyTickets({ apiBase }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/tickets/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to load tickets"),
        );
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [apiBase]);

  return (
    <section className="user-ticket">
      <header>
        <div>
          <p className="eyebrow">Module C</p>
          <h1>My Tickets</h1>
          <p className="lead">Track your submitted maintenance tickets.</p>
        </div>
        <button className="btn ghost" type="button" onClick={loadTickets}>
          Refresh
        </button>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? (
        <div className="table-card">
          <SkeletonBlocks rows={4} columns={1} compact />
        </div>
      ) : null}

      {!loading ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    No tickets yet. Submit an incident from Report Issue.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.category}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.assignedToEmail || "Unassigned"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default MyTickets;
