import { useEffect, useState } from 'react'
import './notification-panel.css'

function NotificationPanel({ apiBase }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const query = unreadOnly ? '?unreadOnly=true' : ''
      const response = await fetch(`${apiBase}/api/notifications${query}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to load notifications')
      }
      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [unreadOnly])

  const markRead = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }
      await loadNotifications()
    } catch (err) {
      setError(err.message || 'Failed to mark notification')
    }
  }

  const markAllRead = async () => {
    try {
      const response = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to mark all')
      }
      await loadNotifications()
    } catch (err) {
      setError(err.message || 'Failed to mark all notifications')
    }
  }

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
          <button className="btn ghost" type="button" onClick={loadNotifications}>
            Refresh
          </button>
          <button className="btn primary" type="button" onClick={markAllRead}>
            Mark all read
          </button>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="status">Loading notifications...</p> : null}

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty">No notifications found.</div>
        ) : (
          notifications.map((item) => (
            <article
              key={item.id}
              className={`notification-card ${item.read ? 'read' : 'unread'}`}
            >
              <div>
                <h2>{item.title}</h2>
                <p>{item.message}</p>
                <span className="meta">Type: {item.type}</span>
              </div>
              <div className="card-actions">
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
    </section>
  )
}

export default NotificationPanel
