import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'
import '../style/Jobs.css'

function navigateTo(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/* ── Constants ── */
const STATUS_OPTIONS = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', noteBorder: '#3b82f6' },
  interview: { label: 'Interview', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', noteBorder: '#f59e0b' },
  offer:     { label: 'Offer',     color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', noteBorder: '#10b981' },
  rejected:  { label: 'Rejected',  color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', noteBorder: '#ef4444' },
  withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db', noteBorder: '#9ca3af' },
}

/* ── StatusBadge ── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status || 'Unknown', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db',
  }
  return (
    <span
      className="status-badge"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

/* ── StatusModal ── */
function StatusModal({ job, onClose, onSave }) {
  const [selected, setSelected] = useState(job.status?.toLowerCase() || 'applied')
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')

  const handleSave = async () => {
    setSaving(true)
    setErr('')
    try {
      const { res, data } = await apiFetch(`/jobs/${job.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: selected }),
      })
      if (!res.ok) throw new Error(data?.error || 'Update failed')
      onSave(job.id, { status: selected })
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__eyebrow">Update Status</div>
        <div className="modal__title">
          {job.company || 'Unknown'}
          <br />
          <span className="modal__subtitle">{job.position || '—'}</span>
        </div>
        <div className="status-options">
          {STATUS_OPTIONS.map(s => {
            const cfg    = STATUS_CONFIG[s]
            const active = selected === s
            return (
              <button
                key={s}
                className="status-option"
                onClick={() => setSelected(s)}
                style={{
                  borderColor: active ? cfg.color : undefined,
                  background:  active ? cfg.bg    : undefined,
                  color:       active ? cfg.color : undefined,
                }}
              >
                <span className="status-option__dot" style={{ background: cfg.color }} />
                {cfg.label}
              </button>
            )
          })}
        </div>
        {err && <div className="modal__error">{err}</div>}
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── EditModal ── */
function EditModal({ job, onClose, onSave }) {
  const [form, setForm] = useState({
    company:     job.company     || '',
    position:    job.position    || '',
    source:      job.source      || '',
    appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : '',
    note:        job.note        || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
    if (Object.keys(payload).length === 0) { setErr('No changes to save'); return }
    setSaving(true); setErr('')
    try {
      const { res, data } = await apiFetch(`/jobs/${job.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(data?.error || 'Update failed')
      onSave(job.id, payload)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__eyebrow">Edit Job</div>
        <div className="modal__title" style={{ marginBottom: 16 }}>{job.company || 'Untitled'}</div>
        <div className="edit-form">
          {[['company','Company','e.g. Acme Corp'],['position','Position','e.g. Frontend Developer'],['source','Source','e.g. LinkedIn, Referral']].map(([field, label, ph]) => (
            <div className="form-field" key={field}>
              <label>{label}</label>
              <input value={form[field]} onChange={set(field)} placeholder={ph} />
            </div>
          ))}
          <div className="form-field">
            <label>Applied Date</label>
            <input type="date" value={form.appliedDate} onChange={set('appliedDate')} />
          </div>
          <div className="form-field">
            <label>Note</label>
            <textarea value={form.note} onChange={set('note')} rows={3} placeholder="Any notes…" />
          </div>
        </div>
        {err && <div className="modal__error">{err}</div>}
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── DeleteModal ── */
function DeleteModal({ job, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const handleConfirm = async () => { setDeleting(true); await onConfirm(job); setDeleting(false) }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__eyebrow">Delete Job</div>
        <div className="modal__title">
          {job.company || 'Unknown'}<br />
          <span className="modal__subtitle">{job.position || '—'}</span>
        </div>
        <p className="delete-modal__warning">This action cannot be undone. The application will be permanently removed.</p>
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Calculate how many days ago from today
function daysAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  // Zero out time for both dates
  now.setHours(0,0,0,0)
  date.setHours(0,0,0,0)
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

/* ── JobCard ── */
function JobCard({ job, onEditJob, onUpdateStatus, onDeleteJob }) {
  const cfg = STATUS_CONFIG[job.status?.toLowerCase()] ?? STATUS_CONFIG.applied
  const dateStr = formatDate(job.appliedDate)
  const daysAgoStr = daysAgo(job.appliedDate)

  return (
    <li className="job-card">
      {/* Top: company + status badge */}
      <div className="job-card__top">
        <div className="job-card__company">{job.company || '—'}</div>
        {job.status && <StatusBadge status={job.status} />}
      </div>

      <div className="job-card__position">Position : {job.position || '—'}</div>

      {/* Meta */}
      <div className="job-card__meta">
        {dateStr && (
          <span className="job-card__meta-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div style={{display:'flex', justifyContent:'space-between', width: '100%'}}>
            <span>Applied: {dateStr}</span>
            <span style={{ color: '#000000', fontSize: 13, marginLeft: 4 ,textAlign:'end'}}>{daysAgoStr}</span>
            </div>
          </span>
        )}
        {job.source && (
          <span className="job-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Source : {job.source}
          </span>
        )}
      </div>

      {/* Note */}
      {job.note && (
        <div
          className="job-card__note"
          style={{ borderLeftColor: cfg.noteBorder, background: cfg.bg }}
        >
         Note : {job.note}
        </div>
      )}

      <div className="job-card__divider" />

      {/* Footer: status label + actions */}
      <div className="job-card__footer">
        <button className="job-card__status-btn" onClick={() => onUpdateStatus(job)}>
          <span className="job-card__status-label">STATUS: {(job.status || 'unknown').toUpperCase()}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div className="job-card__action-icons">
          <button className="icon-btn" onClick={() => onEditJob(job)} title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="icon-btn icon-btn--danger" onClick={() => onDeleteJob(job)} title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}

/* ── Jobs page ── */
export default function Jobs() {
  const [jobs, setJobs]             = useState([])
  const [loadStatus, setLoadStatus] = useState('idle')
  const [error, setError]           = useState('')
  const [statusJob, setStatusJob]   = useState(null)
  const [editJob, setEditJob]       = useState(null)
  const [deleteJob, setDeleteJob]   = useState(null)
  const [filter, setFilter]         = useState('all')
  const [sort, setSort]             = useState('newest')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setError('')
      setLoadStatus('loading')
      try {
        const { res, data } = await apiFetch('/jobs', { method: 'GET' })
        if (!mounted) return
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token')
          navigateTo('/login')
          return
        }
        if (!res.ok) throw new Error(data?.error || 'Load jobs failed')
        setJobs(Array.isArray(data) ? data : [])
        setLoadStatus('ready')
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Load jobs failed')
        setLoadStatus('error')
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const handleJobUpdated = (id, fields) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...fields } : j))
  }

  const handleDeleteConfirmed = async (job) => {
    try {
      const { res, data } = await apiFetch(`/jobs/${job.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(data?.error || 'Delete failed')
      setJobs(prev => prev.filter(j => j.id !== job.id))
      setDeleteJob(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const counts = jobs.reduce((acc, j) => {
    const s = j.status?.toLowerCase() || 'unknown'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const filtered = (filter === 'all' ? jobs : jobs.filter(j => j.status?.toLowerCase() === filter))
    .slice()
    .sort((a, b) => {
      const dateA = a.appliedDate ? new Date(a.appliedDate) : new Date(0)
      const dateB = b.appliedDate ? new Date(b.appliedDate) : new Date(0)
      return sort === 'newest' ? dateB - dateA : dateA - dateB
    })

  const filterTabs = [
    { key: 'all', label: 'All', count: jobs.length },
    ...STATUS_OPTIONS.map(s => ({ key: s, label: STATUS_CONFIG[s].label, count: counts[s] || 0 })),
  ]

  return (
    <div>
      {/* Page header */}
      <div className="jobs-page-header">
        <div>
          <h1 className="jobs-page-title">My Jobs</h1>
          <p className="jobs-page-sub">Tracking {jobs.length} active application{jobs.length !== 1 ? 's' : ''} in your pipeline.</p>
        </div>
      </div>

      {/* Filter tabs + sort + Add Job */}
      {loadStatus === 'ready' && (
        <div className="jobs-toolbar">
          <div className="jobs-filters">
            {filterTabs.map(({ key, label, count }) => {
              const cfg    = STATUS_CONFIG[key]
              const active = filter === key
              return (
                <button
                  key={key}
                  className={`filter-btn${active ? ' filter-btn--active' : ''}`}
                  onClick={() => setFilter(key)}
                  style={active ? {
                    borderColor: cfg ? cfg.color : '#0f172a',
                    background:  cfg ? cfg.bg    : '#f1f5f9',
                    color:       cfg ? cfg.color : '#0f172a',
                  } : undefined}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className="filter-btn__count"
                      style={active && cfg ? { background: cfg.color, color: '#fff' } : undefined}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="jobs-toolbar-right">
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="btn btn--add" onClick={() => navigateTo('/jobs/new')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Job
            </button>
          </div>
        </div>
      )}

      {/* States */}
      {loadStatus === 'loading' && <div className="jobs-loading">Loading…</div>}
      {loadStatus === 'error'   && <div className="jobs-error">{error || 'Load jobs failed'}</div>}

      {loadStatus === 'ready' && jobs.length === 0 && (
        <div className="jobs-empty">
          <div className="jobs-empty__icon">📋</div>
          <div className="jobs-empty__title">No jobs yet</div>
          <div className="jobs-empty__sub">Start by adding a job application</div>
        </div>
      )}

      {filtered.length > 0 && (
        <ul className="job-list">
          {filtered.map((job, idx) => (
            <JobCard
              key={job.id ?? idx}
              job={job}
              onEditJob={setEditJob}
              onUpdateStatus={setStatusJob}
              onDeleteJob={setDeleteJob}
            />
          ))}
        </ul>
      )}

      {loadStatus === 'ready' && jobs.length > 0 && filtered.length === 0 && (
        <div className="jobs-empty-filter">No jobs with this status</div>
      )}

      {statusJob && <StatusModal job={statusJob} onClose={() => setStatusJob(null)} onSave={handleJobUpdated} />}
      {editJob   && <EditModal   job={editJob}   onClose={() => setEditJob(null)}   onSave={handleJobUpdated} />}
      {deleteJob && <DeleteModal job={deleteJob} onClose={() => setDeleteJob(null)} onConfirm={handleDeleteConfirmed} />}
    </div>
  )
}