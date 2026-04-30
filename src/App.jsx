import { useEffect, useMemo, useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/register.jsx'
import Jobs from './pages/Jobs.jsx'
import AddJob from './pages/AddJob.jsx'
import Profile from './pages/profile.jsx'
import { getToken } from './lib/api.js'
import { getUser, fetchUser, logout as userLogout } from './models/user.js'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

/* ─── Router hook ─── */
function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname || '/')

  useEffect(() => {
    const handler = () => setPathname(window.location.pathname || '/')
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = useMemo(() => {
    return (to, { replace = false } = {}) => {
      if (replace) window.history.replaceState({}, '', to)
      else window.history.pushState({}, '', to)
      setPathname(window.location.pathname || '/')
    }
  }, [])

  return { pathname, navigate }
}

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/* ─── Link ─── */
function Link({ to, children, className }) {
  const handleClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    window.history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  return <a href={to} onClick={handleClick} className={className}>{children}</a>
}

/* ─── Navbar ─── */
function Navbar({ pathname, user, onLogout }) {
  const isJobs   = pathname === '/' || pathname === '/jobs'
  const isAddJob = pathname === '/jobs/new'
  const isProfile = pathname === '/me'

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/jobs" className="navbar__logo">
          <span className="navbar__logo-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5f4f0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <path d="M2 12h20"/>
            </svg>
          </span>
          <span className="navbar__logo-text">JobTracker</span>
        </Link>

        <nav className="navbar__nav">
          <Link to="/jobs"     className={`nav-link${isJobs   ? ' nav-link--active' : ''}`}>My Jobs</Link>
          <Link to="/jobs/new" className={`nav-link${isAddJob ? ' nav-link--active' : ''}`}>+ Add Job</Link>
          <Link to="/me" className={`nav-link${isProfile ? ' nav-link--active' : ''}`}>Profile</Link>
          {/* Profile Avatar */}
          {user && (
            <Link to="/me" className="navbar__profile" title="Profile">
              <img 
                src={user.avatarUrl || 'https://via.placeholder.com/32'} 
                alt="Profile" 
                className="navbar__avatar"
              />
            </Link>
          )}
          
          <button className="nav-link" onClick={onLogout} style = {{cursor: 'pointer'}}>
          Logout
        </button>
        </nav>
      </div>
    </header>
  )
}

/* ─── Layout ─── */
function AppLayout({ children, pathname, user, onLogout }) {
  return (
    <div className="app">
      <Navbar pathname={pathname} user={user} onLogout={onLogout} />
      <main className="main">
        <div className="page-enter" key={pathname}>
          {children}
        </div>
      </main>
      <footer className="footer">
        JobTracker · {new Date().getFullYear()}
      </footer>
    </div>
  )
}

/* ─── 404 ─── */
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <div className="not-found__label">Page not found</div>
    </div>
  )
}

/* ─── App ─── */
export default function App() {
  const { pathname, navigate } = usePathname()
  const token = getToken()
  const [user, setUser] = useState(() => getUser() || null)

  // ดึงข้อมูล user เมื่อ login แล้ว (กรณี session หมดอายุ)
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser()
      if (userData) setUser(userData)
    }
    if (token) loadUser()
  }, [token])

  useEffect(() => {
    if (!token && pathname !== '/login' && pathname !== '/register') navigate('/login', { replace: true })
  }, [token, pathname, navigate])

  // ฟังก์ชัน logout
  const handleLogout = () => {
    userLogout()
    navigateTo('/login')
  }

  if (pathname === '/login') {
    return <Login onLoginSuccess={() => navigate('/jobs', { replace: true })} />
  }

  if (pathname === '/register') {
    return <Register />
  }

  if (pathname === '/jobs/new') {
    return (
      <AppLayout pathname={pathname} user={user} onLogout={handleLogout}>
        <AddJob
          onCreated={() => navigate('/jobs', { replace: true })}
          onCancel={() => navigate('/jobs')}
        />
      </AppLayout>
    )
  }

  if (pathname === '/me') {
    return (
      <AppLayout pathname={pathname} user={user} onLogout={handleLogout}>
        <Profile />
      </AppLayout>
    )
  }

  const content = (pathname === '/' || pathname === '/jobs')
    ? <Jobs />
    : <NotFound />

  return (
    <AppLayout pathname={pathname} user={user} onLogout={handleLogout}>
      {content}
    </AppLayout>
  )
}
