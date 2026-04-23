import { useEffect, useMemo, useState } from "react";
import "./ticket-manager.css";

const emptyFilters = {
  status: "",
  priority: "",
  resourceId: "",
  location: "",
  createdByEmail: "",
};

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

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

function TicketManager({ apiBase }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState({ id: "", type: "", value: "" });

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.resourceId) params.set("resourceId", filters.resourceId);
    if (filters.location) params.set("location", filters.location);
    if (filters.createdByEmail)
      params.set("createdByEmail", filters.createdByEmail);
    return params.toString();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const url = filterQuery
        ? `${apiBase}/api/tickets?${filterQuery}`
        : `${apiBase}/api/tickets`;
      const response = await fetch(url, { credentials: "include" });
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
  }, [filterQuery]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openAction = (id, type) => {
    setStatus("");
    setAction({ id, type, value: "" });
  };

  const closeAction = () => {
    setAction({ id: "", type: "", value: "" });
  };

  const submitAction = async () => {
    setError("");
    setStatus("");

    if (!action.id || !action.type || !action.value) {
      setError(
        "Please complete the required action details before confirming.",
      );
      return;
    }

    try {
      const endpoint = `${apiBase}/api/tickets/${action.id}/${action.type}`;
      const payload =
        action.type === "assign"
          ? { technicianEmail: action.value }
          : {
              status: action.value,
              resolutionNotes: action.value,
              reason: action.value,
            };
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, `Failed to ${action.type} ticket`),
        );
      }
      setStatus(
        action.type === "assign"
          ? "Technician assigned successfully."
          : "Ticket status updated successfully.",
      );
      closeAction();
      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to update ticket");
    }
  };

  return (
    <section className="ticket-manager">
      <header>
        <div>
          <p className="eyebrow">Module C</p>
          <h1>Maintenance Tickets</h1>
          <p className="lead">
            Assign technicians, update status, and monitor issues.
          </p>
        </div>
        <button className="btn ghost" type="button" onClick={loadTickets}>
          Refresh
        </button>
      </header>

      <div className="filters">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
        >
          <option value="">All priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <input
          name="resourceId"
          value={filters.resourceId}
          onChange={handleFilterChange}
          placeholder="Resource ID"
        />
        <input
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="Location"
        />
        <input
          name="createdByEmail"
          value={filters.createdByEmail}
          onChange={handleFilterChange}
          placeholder="Created by email"
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="status success">{status}</p> : null}
      {loading ? <p className="status">Loading tickets...</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Created by</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.category}</strong>
                    <span className="muted">
                      {ticket.resourceId || ticket.location}
                    </span>
                  </td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.assignedToEmail || "Unassigned"}</td>
                  <td>{ticket.createdByEmail}</td>
                  <td>
                    <div className="action-row">
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => openAction(ticket.id, "assign")}
                      >
                        Assign
                      </button>
                      <button
                        className="btn primary"
                        type="button"
                        onClick={() => openAction(ticket.id, "status")}
                      >
                        Update status
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {action.id ? (
        <div className="action-panel">
          <div>
            <h2>
              {action.type === "assign" ? "Assign technician" : "Update status"}
            </h2>
            <p>Ticket ID: {action.id}</p>
          </div>
          {action.type === "assign" ? (
            <input
              value={action.value}
              onChange={(event) =>
                setAction((prev) => ({ ...prev, value: event.target.value }))
              }
              placeholder="Technician email"
            />
          ) : (
            <select
              value={action.value}
              onChange={(event) =>
                setAction((prev) => ({ ...prev, value: event.target.value }))
              }
            >
              <option value="">Select status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
          <div className="action-buttons">
            <button className="btn ghost" type="button" onClick={closeAction}>
              Cancel
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={submitAction}
              disabled={!action.value}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TicketManager;
