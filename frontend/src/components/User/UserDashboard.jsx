import { useEffect, useMemo, useState } from "react";
import BookingRequest from "../Module_B/BookingRequest";
import MyBookings from "../Module_B/MyBookings";
import TicketRequest from "../Module_C/TicketRequest";
import MyTickets from "../Module_C/MyTickets";
import NotificationPanel from "../Module_D/NotificationPanel";
import ProfilePanel from "../Profile/ProfilePanel";
import UserResourceView from "../Module_A/UserResourceView";
import "./user-dashboard.css";

const TABS = [
  {
    id: "resources",
    label: "Resources",
    description: "Explore available campus facilities and assets.",
  },
  {
    id: "book",
    label: "Request Booking",
    description: "Create new booking requests for campus resources.",
  },
  {
    id: "my-bookings",
    label: "My Bookings",
    description: "Track the status of your booking submissions.",
  },
  {
    id: "ticket",
    label: "Report Issue",
    description: "Submit maintenance incidents with details and images.",
  },
  {
    id: "my-tickets",
    label: "My Tickets",
    description: "Monitor your reported incidents and technician updates.",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Stay updated with booking, ticket, and system alerts.",
  },
  {
    id: "profile",
    label: "Profile",
    description: "Update your personal details and contact info.",
  },
];

const KPI_BY_TAB = {
  resources: [
    { label: "Total resources", value: "31" },
    { label: "Available now", value: "28" },
    { label: "New this week", value: "3" },
  ],
  book: [
    { label: "Open booking window", value: "Today" },
    { label: "Pending approvals", value: "2" },
    { label: "Preferred rooms", value: "4" },
  ],
  "my-bookings": [
    { label: "Active bookings", value: "3" },
    { label: "Pending requests", value: "1" },
    { label: "This week usage", value: "14 hrs" },
  ],
  ticket: [
    { label: "Open incidents", value: "1" },
    { label: "Avg response", value: "36m" },
    { label: "Attachments", value: "Up to 3" },
  ],
  "my-tickets": [
    { label: "Open tickets", value: "2" },
    { label: "In progress", value: "1" },
    { label: "Resolved this month", value: "5" },
  ],
  notifications: [
    { label: "Unread alerts", value: "4" },
    { label: "System notices", value: "2" },
    { label: "Ticket updates", value: "3" },
  ],
  profile: [
    { label: "Profile status", value: "Active" },
    { label: "Last update", value: "Today" },
    { label: "Visibility", value: "Private" },
  ],
};

function UserDashboard({ user, apiBase, onLogout }) {
  const [activeTab, setActiveTab] = useState("resources");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preselectedResourceId, setPreselectedResourceId] = useState(null);

  const handleRequestBooking = (resourceId) => {
    setPreselectedResourceId(resourceId);
    setActiveTab("book");
  };

  const handleClearPreselect = () => {
    setPreselectedResourceId(null);
  };

  const subtitle = useMemo(() => {
    return user?.email || "user";
  }, [user]);

  const activeTabMeta = useMemo(() => {
    return TABS.find((tab) => tab.id === activeTab) || TABS[0];
  }, [activeTab]);

  const openMobileMenu = () => setSidebarOpen(true);
  const closeMobileMenu = () => setSidebarOpen(false);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    closeMobileMenu();
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(
        `${apiBase}/api/notifications?unreadOnly=true`,
        { credentials: "include" },
      );
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // Ignore badge refresh errors.
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, [apiBase]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className={`user-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-mark">SC</span>
          <div>
            <p className="sidebar-eyebrow">User Portal</p>
            <h2>Smart Campus</h2>
            <p className="meta">{subtitle}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="User modules">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => handleTabSelect(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.id === "notifications" && unreadCount > 0 ? (
                <span
                  className="notif-badge"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {badgeText}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-footnote">
          <p>Workspace mode: User Operations</p>
        </div>

        <button
          className="sidebar-close"
          type="button"
          onClick={closeMobileMenu}
        >
          Close menu
        </button>
      </aside>

      <div className="user-workspace">
        <header className="workspace-topbar">
          <button
            className="menu-toggle"
            type="button"
            onClick={openMobileMenu}
          >
            Menu
          </button>
          <div className="workspace-title-block">
            <p className="eyebrow">Dashboard</p>
            <h3>{activeTabMeta.label}</h3>
            <p className="workspace-subtitle">{activeTabMeta.description}</p>
          </div>

          <div className="workspace-actions">
            <div className="profile-chip">
              <span className="profile-dot" />
              <span>{subtitle}</span>
            </div>
            <button className="logout" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className="user-content">
          <section className="kpi-strip" aria-label="Workspace metrics">
            {(KPI_BY_TAB[activeTab] || []).map((kpi) => (
              <article key={kpi.label} className="kpi-card">
                <p>{kpi.label}</p>
                <h4>{kpi.value}</h4>
              </article>
            ))}
          </section>

          <div key={activeTab} className="view-stage">
            {activeTab === "resources" ? (
              <UserResourceView
                apiBase={apiBase}
                onNavigateToBooking={handleRequestBooking}
              />
            ) : activeTab === "book" ? (
              <BookingRequest
                apiBase={apiBase}
                initialResourceId={preselectedResourceId}
                onClearPreselect={handleClearPreselect}
              />
            ) : activeTab === "my-bookings" ? (
              <MyBookings apiBase={apiBase} />
            ) : activeTab === "ticket" ? (
              <TicketRequest apiBase={apiBase} />
            ) : activeTab === "my-tickets" ? (
              <MyTickets apiBase={apiBase} />
            ) : activeTab === "notifications" ? (
              <NotificationPanel
                apiBase={apiBase}
                onUnreadCountChange={setUnreadCount}
              />
            ) : (
              <ProfilePanel apiBase={apiBase} />
            )}
          </div>
        </main>
      </div>

      {sidebarOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
      ) : null}
    </div>
  );
}

export default UserDashboard;
