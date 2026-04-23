import { useEffect, useState } from 'react'
import './user-booking.css'
import SkeletonBlocks from '../common/SkeletonBlocks'

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json()
    if (data?.message) return data.message
    if (data?.error) return data.error
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return fallbackMessage
}

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
        throw new Error(await parseApiError(response, 'Failed to load bookings'))
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
  }, [apiBase])

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
              <th>Resource</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="4">No bookings yet.</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      ) : null}
    </section>
  )
}

export default MyBookings
