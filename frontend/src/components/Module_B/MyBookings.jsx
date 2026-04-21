import { useEffect, useState } from 'react'
import './user-booking.css'

function MyBookings({ apiBase }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBase}/api/bookings/me`, {
        credentials: 'include',
      })
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return
    setError('')
    try {
      const response = await fetch(`${apiBase}/api/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }
      loadBookings()
    } catch (err) {
      setError(err.message || 'Failed to delete booking')
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return (
    <section className="user-booking">
      <header>
        <div>
          <p className="eyebrow">Module B</p>
          <h1>My Bookings</h1>
          <p className="lead">Track your booking requests and status.</p>
        </div>
        <button className="btn ghost" type="button" onClick={loadBookings}>
          Refresh
        </button>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="status">Loading bookings...</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5">No bookings yet.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceId}</td>
                  <td>{booking.date}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.status}</td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default MyBookings
