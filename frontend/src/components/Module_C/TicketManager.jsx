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
    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;
    const inProgress = tickets.filter(
      (ticket) => ticket.status === "IN_PROGRESS",
    ).length;
    const unassigned = tickets.filter(
      (ticket) => !ticket.assignedToEmail,
    ).length;
    return {
      total: tickets.length,
      open,
      inProgress,
      unassigned,
    };
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
      <header className="ticket-hero">
        <div>
          <p className="eyebrow">Module C</p>
          <h1>Maintenance Tickets</h1>
          <p className="lead">
            Assign technicians, update status, and monitor issues.
          </p>
        </div>
        <div className="hero-actions">
          <span className="hero-chip">Live Operations View</span>
          <button className="btn ghost" type="button" onClick={loadTickets}>
            Refresh
          </button>
        </div>
      </header>

      <section className="tm-metrics" aria-label="Ticket metrics">
        <article className="metric-card">
          <p>Total Tickets</p>
          <h3>{summary.total}</h3>
        </article>
        <article className="metric-card">
          <p>Open</p>
          <h3>{summary.open}</h3>
        </article>
        <article className="metric-card">
          <p>In Progress</p>
          <h3>{summary.inProgress}</h3>
        </article>
        <article className="metric-card">
          <p>Unassigned</p>
          <h3>{summary.unassigned}</h3>
        </article>
      </section>

      <section className="filter-panel" aria-label="Ticket filters">
        <div className="filters">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
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
        <button className="btn ghost" type="button" onClick={resetFilters}>
          Clear filters
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
                            <path d="M12 4a8 8 0 0 0-7.73 6h2.09A6 6 0 1 1 6 12H3l3.5 3.5L10 12H7a5 5 0 1 0 5-5Z" />
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
