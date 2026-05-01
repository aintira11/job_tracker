import { useState } from 'react'
import { apiFetch } from '../lib/api.js'
import '../style/Login.css'

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export default function Register() {
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const { res, data } = await apiFetch('/register', {
        method: 'POST',
        skipAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        setError((data && (data.message || data.error)) || `Registration failed (${res.status})`)
        return
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <span className="login-brand__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5f4f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <path d="M2 12h20"/>
              </svg>
            </span>
            <span className="login-brand__name">JobTracker</span>
          </div>
          <div className="login-form-card" style={{ textAlign: 'center' }}>
            <div className="login-heading" style={{ marginBottom: 8 }}>Registration Complete!</div>
            <div className="login-subheading" style={{ marginBottom: 24 }}>You can now sign in to your account</div>
            <button className="login-btn" onClick={() => navigateTo('/login')}>
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page register-page">
      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5f4f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <path d="M2 12h20"/>
            </svg>
          </span>
          <span className="login-brand__name">JobTracker</span>
        </div>
        <div className="login-form-card">
          {/* Heading inside card */}
          <div className="register-heading">Create your account</div>
          <div className="register-subheading">Start tracking your career journey</div>

          <form className="login-form" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <div className="input-icon-wrap">
                {/* <span className="input-icon"><IconUser /></span> */}
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrap">
                {/* <span className="input-icon"><IconMail /></span> */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrap">
                {/* <span className="input-icon"><IconLock /></span> */}
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <span className="field-hint">Must be at least 6 characters</span>
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

            <button className="login-btn register-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          Already have an account?{' '}
          <button type="button" onClick={() => navigateTo('/login')}>
            Sign in
          </button>
        </div>

      </div>
    </div>
  )
}