import { useMemo, useState } from "react";
import ResourceManager from "../Module_A/ResourceManager";
import BookingManager from "../Module_B/BookingManager";
import TicketManager from "../Module_C/TicketManager";
import NotificationPanel from "../Module_D/NotificationPanel";
import "./admindashboard.css";

const MODULES = [
  {
    id: "module-a",
    label: "Facilities & Assets",
    description: "Manage resources, capacities, and availability states.",
  },
  {
    id: "module-b",
    label: "Bookings",
    description: "Review booking requests and run approval workflows.",
  },
  {
    id: "module-c",
    label: "Tickets",
    description: "Assign technicians and monitor maintenance progress.",
  },
  {
    id: "module-d",
    label: "Notifications",
    description: "Track alerts and communication across operations.",
  },
];

const KPI_BY_MODULE = {
  "module-a": [
    { label: "Active resources", value: "28" },
    { label: "Out of service", value: "3" },
    { label: "Capacity alerts", value: "2" },
  ],
  "module-b": [
    { label: "Pending approvals", value: "6" },
    { label: "Approved today", value: "11" },
    { label: "Conflicts", value: "1" },
  ],
  "module-c": [
    { label: "Open tickets", value: "3" },
    { label: "In progress", value: "2" },
    { label: "Avg resolve", value: "3.2h" },
  ],
  "module-d": [
    { label: "Unread alerts", value: "7" },
    { label: "Escalations", value: "1" },
    { label: "Broadcasts", value: "2" },
  ],
};

function Admindashboard({ user, apiBase, onLogout }) {
  const [activeModule, setActiveModule] = useState("module-a");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subtitle = useMemo(() => {
    return user?.email || "admin";
  }, [user]);

  const activeModuleMeta = useMemo(() => {
    return MODULES.find((module) => module.id === activeModule) || MODULES[0];
  }, [activeModule]);

  const openMobileMenu = () => setSidebarOpen(true);
  const closeMobileMenu = () => setSidebarOpen(false);

  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
    closeMobileMenu();
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-mark">SC</span>
          <div>
            <p className="sidebar-eyebrow">Admin Console</p>
            <h2>Smart Campus</h2>
            <p className="meta">{subtitle}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {MODULES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeModule === item.id ? "active" : ""}
              onClick={() => handleModuleSelect(item.id)}
            >
              <span className="module-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footnote">
          <p>Workspace mode: Operations Administration</p>
        </div>

        <button
          className="sidebar-close"
          type="button"
          onClick={closeMobileMenu}
        >
          Close menu
        </button>
      </aside>

      <div className="admin-workspace">
        <header className="workspace-topbar">
          <button
            className="menu-toggle"
            type="button"
            onClick={openMobileMenu}
          >
            Menu
          </button>

          <div className="workspace-title-block">
            <p className="eyebrow">Operations dashboard</p>
            <h3>{activeModuleMeta.label}</h3>
            <p className="workspace-subtitle">{activeModuleMeta.description}</p>
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

        <main className="admin-content">
          <section className="kpi-strip" aria-label="Operations metrics">
            {(KPI_BY_MODULE[activeModule] || []).map((kpi) => (
              <article key={kpi.label} className="kpi-card">
                <p>{kpi.label}</p>
                <h4>{kpi.value}</h4>
              </article>
            ))}
          </section>

          <div key={activeModule} className="view-stage">
            {activeModule === "module-a" ? (
              <ResourceManager apiBase={apiBase} />
            ) : activeModule === "module-b" ? (
              <BookingManager apiBase={apiBase} />
            ) : activeModule === "module-c" ? (
              <TicketManager apiBase={apiBase} />
            ) : activeModule === "module-d" ? (
              <NotificationPanel apiBase={apiBase} />
            ) : (
              <div className="placeholder">
                <p>Module is coming next.</p>
              </div>
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

export default Admindashboard;
