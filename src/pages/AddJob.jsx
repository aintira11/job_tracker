import { useState } from 'react'
import { apiFetch } from '../lib/api.js'
import { createEmptyJob } from '../models/jobs.js'
import '../style/AddJob.css' // นำเข้า CSS Module

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function AddJob({ onCreated, onCancel }) {
  const [job, setJob] = useState(createEmptyJob())
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
        body: JSON.stringify(job)
      })
      if (res.status === 401 || res.status === 403) {
        navigateTo('/login')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'Create job failed')
      
      onCreated?.(data)
      setJob(createEmptyJob())
    } catch (err) {
      setError(err.message || 'Create job failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1 className="header">🚀 Add New Job</h1>
      <form onSubmit={handleSubmit} className="form">
        
        <div className="fieldGroup">
          <label className="label">Company</label>
          <input
            className="input"
            placeholder="e.g. Google, Line"
            value={job.company}
            onChange={(e) => handleChange('company', e.target.value)}
            required
          />
        </div>

        <div className="fieldGroup">
          <label className="label">Position</label>
          <input
            className="input"
            placeholder="e.g. Frontend Developer"
            value={job.position}
            onChange={(e) => handleChange('position', e.target.value)}
            required
          />
        </div>

        <div className="row">
          <div className="fieldGroup">
            <label className="label">Source</label>
            <input
              className="input"
              placeholder="LinkedIn..."
              value={job.source}
              onChange={(e) => handleChange('source', e.target.value)}
            />
          </div>
          <div className="fieldGroup">
            <label className="label">Applied Date</label>
            <input
              type="date"
              className="input"
              value={job.appliedDate}
              onChange={(e) => handleChange('appliedDate', e.target.value)}
            />
          </div>
        </div>

        <div className="fieldGroup">
          <label className="label">Status</label>
          <select
            className="input"
            value={job.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="open">Open</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="fieldGroup">
          <label className="label">Note</label>
          <textarea
            className="input"
            style={{ minHeight: '80px', resize: 'vertical' }}
            placeholder="Add some details..."
            value={job.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>

        {error && <div className="errorText">{error}</div>}

        <div className="actions">
          <button type="button" onClick={onCancel} className="buttonSecondary">
            Cancel
          </button>
          <button disabled={isSubmitting} className="buttonPrimary">
            {isSubmitting ? 'Saving...' : 'Save Job'}
          </button>
        </div>
      </form>
    </div>
  )
}