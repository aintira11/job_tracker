import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../lib/api.js'
import { getUser, updateUserSession, fetchUser } from '../models/user.js'
import '../style/Profile.css'

/* ── Change Password Modal ── */
function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword]   = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving]             = useState(false)
  const [err, setErr]                   = useState('')
  const [success, setSuccess]           = useState('')

  const [showOld, setShowOld]           = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const handleSave = async () => {
    setErr('')
    setSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErr('Please fill in all fields')
      return
    }
    if (newPassword.length < 6) {
      setErr('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setErr('New passwords do not match')
      return
    }

    setSaving(true)
    try {
      const { res, data } = await apiFetch('/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      if (!res.ok) {
        setErr(data?.error || 'Failed to change password')
        return
      }
      setSuccess('Password changed successfully!')
      setTimeout(() => onClose(), 1200)
    } catch {
      setErr('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  const fields = [
    { label: 'Current Password', value: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld(v => !v) },
    { label: 'New Password',     value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
    { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
  ]

  return (
    <div className="pw-overlay" onClick={onClose}>
      <div className="pw-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pw-modal__header">
          <div>
            <div className="pw-modal__eyebrow">Security</div>
            <div className="pw-modal__title">Change Password</div>
          </div>
          <button className="pw-modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="pw-form">
          {fields.map(({ label, value, set, show, toggle }) => (
            <div className="pw-field" key={label}>
              <label>{label}</label>
              <div className="pw-input-wrap">
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="••••••••"
                  className="pw-input"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <button type="button" className="pw-eye" onClick={toggle}>
                  <EyeIcon open={show} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {err     && <div className="pw-msg pw-msg--err">{err}</div>}
        {success && <div className="pw-msg pw-msg--ok">{success}</div>}

        <div className="pw-modal__footer">
          <button className="pw-btn pw-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="pw-btn pw-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Profile Page ── */
export default function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [showPwModal, setShowPwModal] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const user = getUser()
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatarUrl || '')
    } else {
      fetchUser().then(userData => {
        if (userData) {
          setName(userData.name || '')
          setEmail(userData.email || '')
          setAvatar(userData.avatarUrl || '')
        }
      })
    }
  }, [])

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'image_jobtracker')
    const res = await fetch('https://api.cloudinary.com/v1_1/dtrqbzv6r/image/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return data.secure_url
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const url = await uploadImage(file)
      setAvatar(url)
    } catch {
      setErr('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setErr('')
    setSuccess('')
    try {
      const { res, data } = await apiFetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl: avatar }),
      })
      if (!res.ok) { setErr(data?.message || 'Save failed'); return }
      updateUserSession({ name, avatarUrl: avatar })
      setSuccess('Profile saved!')
    } catch {
      setErr('Error saving profile')
    }
  }

  return (
    <div className="profile-page">
      {/* Page header */}
      <div className="profile-page__header">
        <h1 className="profile-page__title">My Profile</h1>
        <p className="profile-page__sub">Manage your personal information and account security settings.</p>
      </div>

      <div className="profile-layout">
        {/* Left: Avatar card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-wrap">
            <img
              src={preview || avatar || 'https://via.placeholder.com/150'}
              alt="avatar"
              className="profile-avatar-img"
            />
          </div>
          <div className="profile-avatar-name">{name || 'Your Name'}</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            className="profile-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'Uploading…' : 'Upload profile image'}
          </button>
        </div>

        {/* Right: forms */}
        <div className="profile-right">
          {/* Account Information */}
          <div className="profile-card">
            <div className="profile-card__title">Account Information</div>
            <div className="profile-card__divider" />

            <div className="profile-form-field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="profile-input"
              />
            </div>

            <div className="profile-form-field">
              <label>Email Address</label>
              <div className="profile-input-wrap">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="profile-input profile-input--disabled"
                  placeholder="your@email.com"
                />
                <svg className="profile-lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p className="profile-input-hint">Email cannot be changed manually for security reasons.</p>
            </div>

            {err     && <div className="profile-msg profile-msg--err">{err}</div>}
            {success && <div className="profile-msg profile-msg--ok">{success}</div>}

            <div className="profile-card__footer">
              <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
                Save Changes
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="profile-card profile-card--security">
            <div className="profile-security-info">
              <div className="profile-card__title" style={{ marginBottom: 4 }}>Security</div>
              <p className="profile-security-sub">Keep your account safe by updating your password regularly.</p>
            </div>
            <button className="profile-change-pw-btn" onClick={() => setShowPwModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="3"/>
                <path d="M11 8h9"/>
                <path d="M17 5l3 3-3 3"/>
                <circle cx="8" cy="16" r="3"/>
                <path d="M11 16h9"/>
                <path d="M14 13l3 3-3 3"/>
              </svg>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </div>
  )
}