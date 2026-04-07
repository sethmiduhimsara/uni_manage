import { useEffect, useMemo, useState } from 'react'
import Home from './components/Home/Home'
import Admindashboard from './components/Module_E/Admindashboard'

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

  if (loading) {
    return <div>Checking session...</div>
  }

  if (isAdmin) {
    return <Admindashboard />
  }

  return <Home />
}

export default App
