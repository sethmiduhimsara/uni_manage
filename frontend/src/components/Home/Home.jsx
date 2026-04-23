import { useEffect, useMemo, useState } from 'react'
import './home.css'

function Home() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	const apiBase = useMemo(() => {
		return import.meta.env.VITE_API_BASE || 'http://localhost:8080'
	}, [])

	useEffect(() => {
		const loadUser = async () => {
			try {
				const response = await fetch(`${apiBase}/api/auth/me`, {
					credentials: 'include',
				})
				if (!response.ok) {
					setUser(null)
					return
				}
				const data = await response.json()
				setUser(data)
			} catch {
				setUser(null)
			} finally {
				setLoading(false)
			}
		}
		loadUser()
	}, [apiBase])

	const handleLogin = () => {
		window.location.href = `${apiBase}/oauth2/authorization/google`
	}

	const handleDashboardShortcut = () => {
		if (user) {
			window.location.reload()
			return
		}
		handleLogin()
	}

	const handleSupportShortcut = () => {
		document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
	}

	const handleLogout = async () => {
		await fetch(`${apiBase}/logout`, {
			method: 'POST',
			credentials: 'include',
		})
		setUser(null)
	}

	return (
		<div className="home-page">
			<div className="app-shell">
				<div className="backdrop" aria-hidden="true">
					<span className="orb orb-teal" />
					<span className="orb orb-amber" />
					<span className="grid" />
				</div>

			<header className="topbar">
				<div className="brand">
					<span className="brand-mark">SC</span>
					<div>
						<p className="brand-title">Smart Campus Hub</p>
						<p className="brand-sub">Operations & bookings control</p>
					</div>
				</div>

				<nav className="nav-links">
					<a href="#modules">Modules</a>
					<a href="#activity">Activity</a>
					<a href="#support">Support</a>
				</nav>

				<div className="auth-chip">
					{loading ? (
						<span className="status">Checking session...</span>
					) : user ? (
						<>
							<div>
								<p className="status strong">{user.name || user.email}</p>
								<p className="status">{user.roles?.join(', ')}</p>
							</div>
							<button className="button ghost" onClick={handleLogout}>
								Logout
							</button>
						</>
					) : (
						<>
							<div>
								<p className="status strong">Guest access</p>
								<p className="status">Sign in to manage bookings</p>
							</div>
							<button className="button primary" onClick={handleLogin}>
								Sign in with Google
							</button>
						</>
					)}
				</div>
			</header>

			<main className="content">
				<section className="hero">
					<div className="hero-copy">
						<p className="eyebrow">Operations overview</p>
						<h1>Plan, book, and resolve campus operations in one place.</h1>
						<p className="lead">
							Manage facilities, approve bookings, track incidents, and keep the
							community updated with real-time notifications.
						</p>
						<div className="hero-actions">
							<button className="button primary" onClick={handleDashboardShortcut}>
								Open Admin Console
							</button>
							<button className="button ghost" onClick={handleSupportShortcut}>
								View Resource Catalogue
							</button>
						</div>
					</div>

					<div className="hero-panel">
						<div className="panel-card">
							<p className="panel-label">Live status</p>
							<div className="stats">
								<div>
									<h3>28</h3>
									<p>Active rooms</p>
								</div>
								<div>
									<h3>6</h3>
									<p>Pending approvals</p>
								</div>
								<div>
									<h3>3</h3>
									<p>Open tickets</p>
								</div>
							</div>
							<div className="progress">
								<span />
							</div>
							<p className="panel-note">
								Syncs with Spring Boot API via secured sessions.
							</p>
						</div>
					</div>
				</section>

				<section className="module-grid" id="modules">
					<article className="module-card">
						<h2>Facilities & Assets</h2>
						<p>Maintain labs, rooms, and equipment with filters and status.</p>
						<div className="tag-row">
							<span>Catalogue</span>
							<span>Capacity filters</span>
							<span>Status</span>
						</div>
						<button className="button ghost">Open Module A</button>
					</article>
					<article className="module-card">
						<h2>Bookings</h2>
						<p>Handle requests, approvals, and conflict-free scheduling.</p>
						<div className="tag-row">
							<span>Workflow</span>
							<span>Approvals</span>
							<span>Conflicts</span>
						</div>
						<button className="button ghost">Open Module B</button>
					</article>
					<article className="module-card">
						<h2>Maintenance Tickets</h2>
						<p>Capture incidents, assign technicians, and resolve fast.</p>
						<div className="tag-row">
							<span>Attachments</span>
							<span>Technicians</span>
							<span>Comments</span>
						</div>
						<button className="button ghost">Open Module C</button>
					</article>
					<article className="module-card highlight">
						<h2>Notifications</h2>
						<p>Keep users updated on approvals, tickets, and comments.</p>
						<div className="tag-row">
							<span>Alerts</span>
							<span>Unread panel</span>
							<span>History</span>
						</div>
						<button className="button primary">Open Module D</button>
					</article>
				</section>

				<section className="activity" id="activity">
					<div>
						<h2>Recent activity</h2>
						<p>Demo feed sourced from notification events.</p>
					</div>
					<div className="activity-list">
						<div className="activity-item">
							<span className="pill">Booking</span>
							<p>Lab A101 approved for 10:00 - 12:00</p>
							<span className="time">2 mins ago</span>
						</div>
						<div className="activity-item">
							<span className="pill">Ticket</span>
							<p>Projector issue moved to IN_PROGRESS</p>
							<span className="time">14 mins ago</span>
						</div>
						<div className="activity-item">
							<span className="pill">Comment</span>
							<p>Technician added notes on ticket #1092</p>
							<span className="time">1 hour ago</span>
						</div>
					</div>
				</section>
			</main>

				<footer className="footer" id="support">
					<div>
						<h2>Need support?</h2>
						<p>Contact the campus operations desk or review the API docs.</p>
					</div>
					<button className="button ghost">Open API Reference</button>
				</footer>
			</div>
		</div>
	)
}

export default Home
