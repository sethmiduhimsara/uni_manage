import { useMemo, useState } from 'react'
import ResourceManager from '../Module_A/ResourceManager'
import BookingManager from '../Module_B/BookingManager'
import './admindashboard.css'

const MODULES = [
  { id: 'module-a', label: 'Facilities & Assets' },
  { id: 'module-b', label: 'Bookings' },
  { id: 'module-c', label: 'Tickets' },
  { id: 'module-d', label: 'Notifications' },
]

function Admindashboard({ user, apiBase, onLogout }) {
  const [activeModule, setActiveModule] = useState('module-a')

  const subtitle = useMemo(() => {
    return user?.email || 'admin'
  }, [user])

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <p className="sidebar-eyebrow">Admin Console</p>
          <h2>Smart Campus</h2>
          <p className="meta">{subtitle}</p>
        </div>
        <nav className="sidebar-nav">
          {MODULES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeModule === item.id ? 'active' : ''}
              onClick={() => setActiveModule(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="logout" type="button" onClick={onLogout}>
          Log out
        </button>
      </aside>

      <main className="admin-content">
        {activeModule === 'module-a' ? (
          <ResourceManager apiBase={apiBase} />
        ) : activeModule === 'module-b' ? (
          <BookingManager apiBase={apiBase} />
        ) : (
          <div className="placeholder">
            <p>Module is coming next.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admindashboard