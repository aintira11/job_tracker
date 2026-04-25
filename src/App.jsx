import { useEffect, useMemo, useState } from 'react'
import Login from './pages/Login.jsx'
import Jobs from './pages/Jobs.jsx'
import AddJob from './pages/AddJob.jsx'
import { getToken } from './lib/api.js'
import './App.css'

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
function Navbar({ pathname }) {
  const isJobs   = pathname === '/' || pathname === '/jobs'
  const isAddJob = pathname === '/jobs/new'
  // const Logout = pathname === '/login' ? null : () => {
  //   localStorage.removeItem('token')
  //   window.location.href = '/login'
  // }
    const Logout = () => {
    localStorage.removeItem('token')
    navigateTo('/login')
  }

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
          <button className="nav-link" onClick={() => { localStorage.removeItem('token'); navigateTo('/login') }}style = {{cursor: 'pointer'}}>
          Logout
        </button>
        </nav>
      </div>
    </header>
  )
}

/* ─── Layout ─── */
function AppLayout({ children, pathname }) {
  return (
    <div className="app">
      <Navbar pathname={pathname} />
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

  useEffect(() => {
    if (!token && pathname !== '/login') navigate('/login', { replace: true })
  }, [token, pathname, navigate])

  if (pathname === '/login') {
    return <Login onLoginSuccess={() => navigate('/jobs', { replace: true })} />
  }

  if (pathname === '/jobs/new') {
    return (
      <AppLayout pathname={pathname}>
        <AddJob
          onCreated={() => navigate('/jobs', { replace: true })}
          onCancel={() => navigate('/jobs')}
        />
      </AppLayout>
    )
  }

  const content = (pathname === '/' || pathname === '/jobs')
    ? <Jobs />
    : <NotFound />

  return <AppLayout pathname={pathname}>{content}</AppLayout>
}