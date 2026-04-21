import { useEffect, useState } from 'react'
import './user-booking.css'

const emptyForm = {
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: 1,
}

function BookingRequest({ apiBase }) {
  const [form, setForm] = useState(emptyForm)
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResources(true)
      try {
        const response = await fetch(`${apiBase}/api/resources`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to load resources')
        }
        const data = await response.json()
        setResources(data)
      } catch (err) {
        setError(err.message || 'Failed to load resources')
      } finally {
        setLoadingResources(false)
      }
    }
    loadResources()
  }, [apiBase])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')
    setSubmitting(true)
    try {
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          expectedAttendees: Number(form.expectedAttendees),
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit booking')
      }
      setForm(emptyForm)
      setStatus('Booking request submitted.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="user-booking">
      <header>
        <div>
          {/* <p className="eyebrow">Module B</p> */}
          <h1>Request a Booking</h1>
          <p className="lead">Submit a booking request for a resource.</p>
        </div>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="grid">
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
          >
            <option value="">
              {loadingResources ? 'Loading resources...' : 'Select a resource'}
            </option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - {resource.location}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleChange}
            required
          />
          <input
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleChange}
            required
          />
          <input
            name="expectedAttendees"
            type="number"
            min="1"
            value={form.expectedAttendees}
            onChange={handleChange}
            placeholder="Expected attendees"
          />
          <input
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="Purpose"
            required
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        {status ? <p className="status">{status}</p> : null}
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit booking'}
        </button>
      </form>
    </section>
  )
}

export default BookingRequest
