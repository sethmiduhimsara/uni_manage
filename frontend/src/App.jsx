import { useEffect, useMemo, useState } from 'react'
import Home from './components/Home/Home'
import Admindashboard from './components/Module_E/Admindashboard'
import UserDashboard from './components/User/UserDashboard'

function App() {
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

  const isAdmin = user?.roles?.includes('ROLE_ADMIN')

  const handleLogout = async () => {
    await fetch(`${apiBase}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
  }

  if (loading) {
    return <div>Checking session...</div>
  }

  if (isAdmin) {
    return <Admindashboard user={user} apiBase={apiBase} onLogout={handleLogout} />
  }
  if (user) {
    return <UserDashboard user={user} apiBase={apiBase} onLogout={handleLogout} />
  }

  return <Home />
}

export default App
