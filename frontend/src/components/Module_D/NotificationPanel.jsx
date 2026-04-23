import { useEffect, useState } from "react";
import "./notification-panel.css";
import SkeletonBlocks from "../common/SkeletonBlocks";

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return fallbackMessage;
}

function NotificationPanel({ apiBase, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const formatTimestamp = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const query = unreadOnly ? "?unreadOnly=true" : "";
      const response = await fetch(`${apiBase}/api/notifications${query}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to load notifications"),
        );
      }
      const data = await response.json();
      setNotifications(data);
      if (onUnreadCountChange) {
        const unreadCount = Array.isArray(data)
          ? data.reduce((total, item) => (item.read ? total : total + 1), 0)
          : 0;
        onUnreadCountChange(unreadCount);
      }
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [apiBase, unreadOnly]);

  const markRead = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to mark as read"),
        );
      }
      await loadNotifications();
    } catch (err) {
      setError(err.message || "Failed to mark notification");
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to mark all notifications"),
        );
      }
      await loadNotifications();
    } catch (err) {
      setError(err.message || "Failed to mark all notifications");
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch(`${apiBase}/api/notifications`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to clear notifications"),
        );
      }
      setNotifications([]);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (err) {
      setError(err.message || "Failed to clear notifications");
    }
  };

  return (
    <section className="notification-panel">
      <header>
        <div>
          <p className="eyebrow">Module D</p>
          <h1>Notifications</h1>
          <p className="lead">Track booking and ticket updates in real-time.</p>
        </div>
        <div className="actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            Show unread only
          </label>
          <button
            className="btn ghost"
            type="button"
            onClick={loadNotifications}
          >
            Refresh
          </button>
          <button className="btn primary" type="button" onClick={markAllRead}>
            Mark all read
          </button>
          <button className="btn ghost" type="button" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? (
        <div className="table-card">
          <SkeletonBlocks rows={4} columns={1} compact />
        </div>
      ) : null}

      {!loading ? (
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty">No notifications found.</div>
          ) : (
            notifications.map((item) => (
              <article
                key={item.id}
                className={`notification-card ${item.read ? "read" : "unread"}`}
              >
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.message}</p>
                  <span className="meta">Type: {item.type}</span>
                </div>
                <div className="card-actions">
                  <span className="time">{formatTimestamp(item.createdAt)}</span>
                  {!item.read ? (
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => markRead(item.id)}
                    >
                      Mark read
                    </button>
                  ) : (
                    <span className="muted">Read</span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}

export default NotificationPanel;
