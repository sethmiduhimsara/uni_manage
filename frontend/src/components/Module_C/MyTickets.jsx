//MyTickets.jsx

import { useEffect, useState } from "react";
import "./user-ticket.css";
import SkeletonBlocks from "../common/SkeletonBlocks";

const editableTicketDefaults = {
  id: "",
  description: "",
  priority: "MEDIUM",
  contactDetails: "",
};

function statusClass(status) {
  return `status-pill ${String(status || "OPEN")
    .toLowerCase()
    .replaceAll("_", "-")}`;
}

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
  const [status, setStatus] = useState("");
  const [editingTicket, setEditingTicket] = useState(editableTicketDefaults);

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

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(ticket.status),
  ).length;

  const startEditing = (ticket) => {
    setStatus("");
    setError("");
    setEditingTicket({
      id: ticket.id,
      description: ticket.description || "",
      priority: ticket.priority || "MEDIUM",
      contactDetails: ticket.contactDetails || "",
    });
  };

  const cancelEditing = () => {
    setEditingTicket(editableTicketDefaults);
  };

  const updateEditingValue = (event) => {
    const { name, value } = event.target;
    setEditingTicket((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingTicket.id) {
      return;
    }
    setError("");
    setStatus("");

    try {
      const response = await fetch(
        `${apiBase}/api/tickets/${editingTicket.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            description: editingTicket.description,
            priority: editingTicket.priority,
            contactDetails: editingTicket.contactDetails,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to update ticket"),
        );
      }

      setStatus("Ticket updated successfully.");
      cancelEditing();
      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to update ticket");
    }
  };

  return (
    <section className="user-ticket">
      <header className="ticket-hero">
        <div>
          <p className="eyebrow">Module C</p>
          <h1>My Tickets</h1>
          <p className="lead">Track your submitted maintenance tickets.</p>
        </div>
        <button className="btn ghost" type="button" onClick={loadTickets}>
          Refresh
        </button>
      </header>

      <section className="ticket-stats" aria-label="Ticket metrics">
        <article>
          <p>Open</p>
          <h3>{openCount}</h3>
        </article>
        <article>
          <p>In Progress</p>
          <h3>{inProgressCount}</h3>
        </article>
        <article>
          <p>Resolved</p>
          <h3>{resolvedCount}</h3>
        </article>
      </section>

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="status">{status}</p> : null}
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No tickets yet. Submit an incident from Report Issue.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.category}</td>
                    <td>{ticket.priority}</td>
                    <td>
                      <span className={statusClass(ticket.status)}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.assignedToEmail || "Unassigned"}</td>
                    <td>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => startEditing(ticket)}
                        disabled={ticket.status !== "OPEN"}
                        title={
                          ticket.status === "OPEN"
                            ? "Edit ticket"
                            : "Only OPEN tickets can be edited"
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {editingTicket.id ? (
        <form className="form-card ticket-edit-card" onSubmit={submitEdit}>
          <div className="card-head">
            <h2>Edit Ticket</h2>
            <p>
              Update fields for ticket <strong>{editingTicket.id}</strong>
            </p>
          </div>
          <div className="grid">
            <select
              name="priority"
              value={editingTicket.priority}
              onChange={updateEditingValue}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <input
              name="contactDetails"
              value={editingTicket.contactDetails}
              onChange={updateEditingValue}
              placeholder="Contact details"
              required
            />
          </div>
          <textarea
            name="description"
            value={editingTicket.description}
            onChange={updateEditingValue}
            rows="4"
            placeholder="Describe the issue"
            required
          />
          <div className="action-row-inline">
            <button className="btn ghost" type="button" onClick={cancelEditing}>
              Cancel
            </button>
            <button className="btn primary" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default MyTickets;
