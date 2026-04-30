import { useState } from 'react'
import { login } from '../models/user.js'
import { apiFetch } from '../lib/api.js'
import '../style/Login.css'
import { loginWithGoogle } from '../../firebase.js'

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const GoogleLogo = () => (
  <svg className="google-logo" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
)

export default function Login({ onLoginSuccess }) {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError]               = useState('')

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

  const handleGoogleLogin = async () => {
    setError('')
    setIsGoogleLoading(true)
    try {
      const token = await loginWithGoogle()
      const { res, data } = await apiFetch('/login/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error()
      localStorage.setItem('token', data.token)
      onLoginSuccess?.()
    } catch {
      setError('Google login failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Brand Icon */}
        <div className="login-brand">
          <span className="login-brand__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5f4f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <path d="M2 12h20"/>
            </svg>
          </span>
        </div>

        {/* Heading */}
        <div className="login-heading">Welcome back</div>
        <div className="login-subheading">Sign in to manage your applications</div>

        {/* Form Card */}
        <div className="login-form-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="name@company.com"
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

            {/* OR Divider */}
            <div className="login-divider">or</div>

            {/* Google Button */}
            <button
              type="button"
              className="login-btn-google"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleLogo />
              {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigateTo('/register')}>
            Sign up
          </button>
        </div>

      </div>
    </div>
  )
}