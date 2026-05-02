import { useState } from 'react'
import { apiFetch } from '../lib/api.js'
import { createEmptyJob } from '../models/jobs.js'
import '../style/AddJob.css'

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const SOURCE_OPTIONS = ['LinkedIn', 'Indeed', 'JobThai', 'JobsDB', 'Jobbkk', 'Other']
const STATUS_OPTIONS = [
  { value: 'applied',   label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer',     label: 'Offer' },
  { value: 'rejected',  label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

export default function AddJob({ onCreated, onCancel }) {
  const [job, setJob] = useState({ ...createEmptyJob(), status: 'applied' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setJob((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const { res, data } = await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify(job),
      })
      if (res.status === 401 || res.status === 403) { navigateTo('/login'); return }
      if (!res.ok) throw new Error(data?.error || 'Create job failed')
      onCreated?.(data)
      setJob({ ...createEmptyJob(), status: 'applied' })
    } catch (err) {
      setError(err.message || 'Create job failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="addjob-page">
      {/* Page header */}
      <div className="addjob-page__header">
        <h1 className="addjob-page__title">Add Job</h1>
        <p className="addjob-page__sub">Log a new opportunity to your tracking pipeline.</p>
      </div>

      {/* Card */}
      <div className="addjob-card">
        <form onSubmit={handleSubmit} className="addjob-form">

          {/* Company Name */}
          <div className="addjob-field">
            <label className="addjob-label">
              Company Name <span className="addjob-required">*</span>
            </label>
            <input
              className="addjob-input"
              placeholder="e.g. Acme Corp"
              value={job.company}
              onChange={(e) => handleChange('company', e.target.value)}
              required
            />
          </div>

          {/* Position + Applied Date */}
          <div className="addjob-row">
            <div className="addjob-field">
              <label className="addjob-label">Position</label>
              <input
                className="addjob-input"
                placeholder="e.g. Senior UI Designer"
                value={job.position}
                onChange={(e) => handleChange('position', e.target.value)}
              />
            </div>
            <div className="addjob-field">
              <label className="addjob-label">Applied date</label>
              <input
                type="date"
                className="addjob-input"
                value={job.appliedDate}
                onChange={(e) => handleChange('appliedDate', e.target.value)}
              />
            </div>
          </div>

          {/* Source + Status */}
          <div className="addjob-row">
            <div className="addjob-field">
              <label className="addjob-label">Source</label>
              <div className="addjob-select-wrap">
                <select
                  className="addjob-input addjob-select"
                  value={job.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                >
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <svg className="addjob-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div className="addjob-field">
              <label className="addjob-label">Status</label>
              <div className="addjob-select-wrap">
                <select
                  className="addjob-input addjob-select"
                  value={job.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <svg className="addjob-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="addjob-field">
            <label className="addjob-label">Note</label>
            <textarea
              className="addjob-input addjob-textarea"
              placeholder="Add details about the hiring manager, interview rounds, or salary expectations..."
              value={job.note}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>

          {error && <div className="addjob-error">{error}</div>}

          {/* Footer */}
          <div className="addjob-divider" />
          <div className="addjob-actions">
            <button type="button" onClick={onCancel} className="addjob-btn addjob-btn--cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="addjob-btn addjob-btn--save"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}