import { useEffect, useState } from 'react'
import './user-ticket.css'

const emptyForm = {
  resourceId: '',
  location: '',
  category: '',
  description: '',
  priority: 'MEDIUM',
  contactDetails: '',
}

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json()
    if (data?.message) return data.message
    if (data?.error) return data.error
  } catch {
    // Fall back to generic message when API body is not JSON.
  }
  return fallbackMessage
}

function TicketRequest({ apiBase }) {
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

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

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || [])
    if (selected.length > 3) {
      setError('You can upload up to 3 images only.')
      setFiles(selected.slice(0, 3))
      return
    }
    setError('')
    setFiles(selected)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')
    try {
      const ticketPayload = {
        resourceId: form.resourceId || null,
        location: form.location || null,
        category: form.category,
        description: form.description,
        priority: form.priority,
        contactDetails: form.contactDetails,
      }
      const body = new FormData()
      body.append(
        'ticket',
        new Blob([JSON.stringify(ticketPayload)], {
          type: 'application/json',
        })
      )
      files.slice(0, 3).forEach((file) => body.append('files', file))

      const response = await fetch(`${apiBase}/api/tickets`, {
        method: 'POST',
        credentials: 'include',
        body,
      })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to submit ticket'))
      }
      setForm(emptyForm)
      setFiles([])
      setStatus('Ticket submitted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to submit ticket')
    }
  }

  return (
    <section className="user-ticket">
      <header>
        <div>
          <p className="eyebrow">Module C</p>
          <h1>Report an Incident</h1>
          <p className="lead">Create a maintenance ticket with evidence.</p>
        </div>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="grid">
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
          >
            <option value="">
              {loadingResources ? 'Loading resources...' : 'Select resource (optional)'}
            </option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - {resource.location}
              </option>
            ))}
          </select>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location (optional)"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            required
          />
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            name="contactDetails"
            value={form.contactDetails}
            onChange={handleChange}
            placeholder="Contact details"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue"
          rows="4"
          required
        />
        <input type="file" multiple accept="image/*" onChange={handleFiles} />
        <p className="hint">Attach up to 3 images (JPG, PNG, GIF, WEBP).</p>
        {error ? <p className="error">{error}</p> : null}
        {status ? <p className="status">{status}</p> : null}
        <button className="btn primary" type="submit">
          Submit ticket
        </button>
      </form>
    </section>
  )
}

export default TicketRequest
