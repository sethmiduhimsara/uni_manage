import { useMemo, useState } from 'react'
import BookingRequest from '../Module_B/BookingRequest'
import MyBookings from '../Module_B/MyBookings'
import TicketRequest from '../Module_C/TicketRequest'
import MyTickets from '../Module_C/MyTickets'
import NotificationPanel from '../Module_D/NotificationPanel'
import './user-dashboard.css'

const TABS = [
  { id: 'book', label: 'Request Booking' },
  { id: 'my-bookings', label: 'My Bookings' },
  { id: 'ticket', label: 'Report Issue' },
  { id: 'my-tickets', label: 'My Tickets' },
  { id: 'notifications', label: 'Notifications' },
]

function UserDashboard({ user, apiBase, onLogout }) {
  const [activeTab, setActiveTab] = useState('book')

  const subtitle = useMemo(() => {
    return user?.email || 'user'
  }, [user])

  return (
    <div className="user-shell">
      <header className="user-topbar">
        <div>
          <p className="eyebrow">User Portal</p>
          <h2>Smart Campus</h2>
          <p className="meta">{subtitle}</p>
        </div>
        <nav>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="logout" type="button" onClick={onLogout}>
          Log out
        </button>
      </header>

      <main className="user-content">
        {activeTab === 'book' ? (
          <BookingRequest apiBase={apiBase} />
        ) : activeTab === 'my-bookings' ? (
          <MyBookings apiBase={apiBase} />
        ) : activeTab === 'ticket' ? (
          <TicketRequest apiBase={apiBase} />
        ) : activeTab === 'my-tickets' ? (
          <MyTickets apiBase={apiBase} />
        ) : (
          <NotificationPanel apiBase={apiBase} />
        )}
      </main>
    </div>
  )
}

export default UserDashboard
