import { useEffect, useMemo, useState } from 'react'
import './resource-manager.css'

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  location: '',
  capacity: 1,
  status: 'ACTIVE',
  availabilityWindows: '',
  description: '',
}

function ResourceManager({ apiBase }) {
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    status: '',
    minCapacity: '',
  })
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.location) params.set('location', filters.location)
    if (filters.status) params.set('status', filters.status)
    if (filters.minCapacity) params.set('minCapacity', filters.minCapacity)
    return params.toString()
  }, [filters])

  const loadResources = async () => {
    setLoading(true)
    setError('')
    try {
      const url = filterQuery
        ? `${apiBase}/api/resources/filter?${filterQuery}`
        : `${apiBase}/api/resources`
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to load resources')
      }
      const data = await response.json()
      setResources(data)
    } catch (err) {
      setError(err.message || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [filterQuery])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      capacity: Number(form.capacity),
      status: form.status,
      availabilityWindows: form.availabilityWindows
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      description: form.description,
    }

    try {
      const response = await fetch(`${apiBase}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Failed to create resource')
      }
      setForm(emptyForm)
      await loadResources()
    } catch (err) {
      setError(err.message || 'Failed to create resource')
    }
  }

  return (
    <section className="resource-manager">
      <header>
        <div>
          <p className="eyebrow">Module A</p>
          <h1>Facilities & Assets Catalogue</h1>
          <p className="lead">Manage rooms, labs, and equipment availability.</p>
        </div>
        <button className="button ghost" onClick={loadResources}>
          Refresh
        </button>
      </header>

      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All types</option>
          <option value="LECTURE_HALL">Lecture hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
        <input
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="Location"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of service</option>
        </select>
        <input
          name="minCapacity"
          type="number"
          min="1"
          value={filters.minCapacity}
          onChange={handleFilterChange}
          placeholder="Min capacity"
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="status">Loading resources...</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan="5">No resources yet.</td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.location}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form className="form-card" onSubmit={handleCreate}>
        <h2>Create resource</h2>
        <div className="grid">
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Resource name"
            required
          />
          <select name="type" value={form.type} onChange={handleFormChange}>
            <option value="LECTURE_HALL">Lecture hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          <input
            name="location"
            value={form.location}
            onChange={handleFormChange}
            placeholder="Location"
            required
          />
          <input
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={handleFormChange}
            placeholder="Capacity"
            required
          />
          <select name="status" value={form.status} onChange={handleFormChange}>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of service</option>
          </select>
          <input
            name="availabilityWindows"
            value={form.availabilityWindows}
            onChange={handleFormChange}
            placeholder="Availability windows (comma-separated)"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          placeholder="Description"
          rows="3"
        />
        <button className="button primary" type="submit">
          Save resource
        </button>
      </form>
    </section>
  )
}

export default ResourceManager
