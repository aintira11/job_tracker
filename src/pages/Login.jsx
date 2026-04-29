import { useState } from 'react'
import { login } from '../models/user.js'
import '../style/Login.css'

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function Login({ onLoginSuccess }) {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      onLoginSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand__icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f5f4f0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <path d="M2 12h20"/>
            </svg>
          </span>
          <span className="login-brand__name">JobTracker</span>
        </div>

        {/* Heading */}
        <div className="login-heading">Welcome back</div>
        <div className="login-subheading">Sign in to manage your applications</div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        <button
    type="button"
    onClick={() => navigateTo('/register')}
    style={{
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: 0
    }}
  >
    Sign up
  </button>
        </form>
        

      </div>
    </div>
  )
}