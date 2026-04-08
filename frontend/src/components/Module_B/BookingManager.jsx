import { useEffect, useMemo, useState } from 'react'
import './booking-manager.css'

const emptyFilters = {
  status: '',
  resourceId: '',
  date: '',
  userEmail: '',
}

function BookingManager({ apiBase }) {
  const [bookings, setBookings] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState({ id: '', type: '', reason: '' })

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.resourceId) params.set('resourceId', filters.resourceId)
    if (filters.date) params.set('date', filters.date)
    if (filters.userEmail) params.set('userEmail', filters.userEmail)
    return params.toString()
  }, [filters])

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const url = filterQuery
        ? `${apiBase}/api/bookings?${filterQuery}`
        : `${apiBase}/api/bookings`
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [filterQuery])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const openAction = (id, type) => {
    setAction({ id, type, reason: '' })
  }

  const closeAction = () => {
    setAction({ id: '', type: '', reason: '' })
  }

  const submitAction = async () => {
    setError('')
    try {
      const endpoint = `${apiBase}/api/bookings/${action.id}/${action.type}`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: action.reason }),
      })
      if (!response.ok) {
        throw new Error(`Failed to ${action.type} booking`)
      }
      closeAction()
      await loadBookings()
    } catch (err) {
      setError(err.message || 'Failed to update booking')
    }
  }

  const handleActionReason = (event) => {
    setAction((prev) => ({ ...prev, reason: event.target.value }))
  }

  return (
    <section className="booking-manager">
      <header>
        <div>
          <p className="eyebrow">Module B</p>
          <h1>Booking Management</h1>
          <p className="lead">Review, approve, and manage booking requests.</p>
        </div>
        <button className="btn ghost" type="button" onClick={loadBookings}>
          Refresh
        </button>
      </header>

      <div className="filters">
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          name="resourceId"
          value={filters.resourceId}
          onChange={handleFilterChange}
          placeholder="Resource ID"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <input
          name="userEmail"
          value={filters.userEmail}
          onChange={handleFilterChange}
          placeholder="User email"
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="status">Loading bookings...</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Date</th>
              <th>Time</th>
              <th>User</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6">No bookings found.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceId}</td>
                  <td>{booking.date}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.userEmail}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === 'PENDING' ? (
                      <div className="action-row">
                        <button
                          className="btn primary"
                          type="button"
                          onClick={() => openAction(booking.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => openAction(booking.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : booking.status === 'APPROVED' ? (
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => openAction(booking.id, 'cancel')}
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
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
            <h2>{action.type.toUpperCase()} booking</h2>
            <p>Booking ID: {action.id}</p>
          </div>
          <input
            value={action.reason}
            onChange={handleActionReason}
            placeholder={
              action.type === 'reject'
                ? 'Rejection reason (required)'
                : 'Reason (optional)'
            }
          />
          <div className="action-buttons">
            <button className="btn ghost" type="button" onClick={closeAction}>
              Cancel
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={submitAction}
              disabled={action.type === 'reject' && !action.reason.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BookingManager
