import { useEffect, useMemo, useState } from "react";
import "./ticket-manager.css";
import SkeletonBlocks from "../common/SkeletonBlocks";

const emptyFilters = {
  status: "",
  priority: "",
  resourceId: "",
  location: "",
  createdByEmail: "",
};

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

function prettyStatus(status) {
  return String(status || "OPEN").replaceAll("_", " ");
}

function statusClass(status) {
  return `tm-status tm-status-${String(status || "OPEN")
    .toLowerCase()
    .replaceAll("_", "-")}`;
}

function priorityClass(priority) {
  return `tm-priority tm-priority-${String(priority || "MEDIUM").toLowerCase()}`;
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

function TicketManager({ apiBase }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState({ id: "", type: "", value: "" });

  const summary = useMemo(() => {
    const counts = {
      TOTAL: tickets.length,
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REJECTED: 0,
      UNASSIGNED: 0
    };
    
    tickets.forEach(ticket => {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status]++;
      }
      if (!ticket.assignedToEmail) {
        counts.UNASSIGNED++;
      }
    });

    return counts;
  }, [tickets]);

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

  const resetFilters = () => {
    setFilters(emptyFilters);
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

  const deleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      "Delete this ticket permanently? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setError("");
    setStatus("");
    try {
      const response = await fetch(`${apiBase}/api/tickets/${ticketId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to delete ticket"),
        );
      }
      setStatus("Ticket deleted successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to delete ticket");
    }
  };

  return (
    <section className="ticket-manager">
      <nav className="tm-tabs" aria-label="Ticket status filters">
        <button 
          className={`tm-tab ${!filters.status ? 'active' : ''}`}
          type="button"
          onClick={() => handleFilterChange({ target: { name: 'status', value: '' } })}
        >
          <span className="tab-label">All Tickets</span>
          <span className="tab-count">{summary.TOTAL}</span>
        </button>
        {statusOptions.map((opt) => (
          <button 
            key={opt}
            className={`tm-tab tm-tab-${opt.toLowerCase().replace('_', '-')} ${filters.status === opt ? 'active' : ''}`}
            type="button"
            onClick={() => handleFilterChange({ target: { name: 'status', value: opt } })}
          >
            <span className="tab-label">{prettyStatus(opt)}</span>
            <span className="tab-count">{summary[opt]}</span>
          </button>
        ))}
      </nav>

      <section className="filter-bar" aria-label="Ticket filters">
        <div className="filter-group">
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority} Priority
              </option>
            ))}
          </select>
          <input
            name="resourceId"
            value={filters.resourceId}
            onChange={handleFilterChange}
            placeholder="Resource ID..."
          />
          <input
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Location..."
          />
          <input
            name="createdByEmail"
            value={filters.createdByEmail}
            onChange={handleFilterChange}
            placeholder="Created by..."
          />
        </div>
        <button className="btn-clear" type="button" onClick={resetFilters}>
          Reset
        </button>
        <button className="btn-refresh" type="button" onClick={loadTickets}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </section>

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="status success">{status}</p> : null}

      {loading ? (
        <div className="table-card">
          <SkeletonBlocks rows={5} columns={1} compact />
        </div>
      ) : null}

      {!loading ? (
        <div className="table-card">
          <table className="ticket-table">
            <colgroup>
              <col className="ticket-col ticket-col-ticket" />
              <col className="ticket-col ticket-col-priority" />
              <col className="ticket-col ticket-col-status" />
              <col className="ticket-col ticket-col-assigned" />
              <col className="ticket-col ticket-col-created" />
              <col className="ticket-col ticket-col-action" />
            </colgroup>
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
                  <td colSpan="6">
                    <div className="tm-empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      <p>No tickets found matching your current filters.</p>
                      <button className="btn ghost sm" onClick={resetFilters}>Clear all filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.category}</strong>
                      <span className="muted">
                        {ticket.resourceId || ticket.location}
                      </span>
                      <span className="ticket-id">#{ticket.id}</span>
                    </td>
                    <td>
                      <span className={priorityClass(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={statusClass(ticket.status)}>
                        {prettyStatus(ticket.status)}
                      </span>
                    </td>
                    <td>{ticket.assignedToEmail || "Unassigned"}</td>
                    <td>{ticket.createdByEmail}</td>
                    <td>
                      <div className="action-row">
                        <button
                          className="ticket-action-btn ticket-action-assign"
                          type="button"
                          onClick={() => openAction(ticket.id, "assign")}
                          aria-label="Assign technician"
                          title="Assign technician"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M15 8a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z" />
                            <path d="M12 13c-2.67 0-8 1.34-8 4v1h11v-1c0-2.66-5.33-4-8-4Z" />
                            <path d="M19 8v2h2v2h-2v2h-2v-2h-2v-2h2V8h2Z" />
                          </svg>
                          <span className="sr-only">Assign</span>
                        </button>
                        <button
                          className="ticket-action-btn ticket-action-update"
                          type="button"
                          onClick={() => openAction(ticket.id, "status")}
                          aria-label="Update status"
                          title="Update status"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Z" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0L15.13 5.12l3.75 3.75l1.83-1.83Z" />
                          </svg>
                          <span className="sr-only">Update status</span>
                        </button>
                        <button
                          className="ticket-action-btn ticket-action-delete"
                          type="button"
                          onClick={() => deleteTicket(ticket.id)}
                          aria-label="Delete ticket"
                          title="Delete ticket"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" />
                            <path d="M7 9h10l-1 11H8L7 9Z" />
                          </svg>
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

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
