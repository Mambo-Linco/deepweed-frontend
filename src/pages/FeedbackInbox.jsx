import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import { FeedbackBody, StatusBadge } from '../components/FeedbackCommon.jsx'

const FILTERS = ['', 'pending', 'reviewed', 'resolved']

// Admin: read farmer feedback and reply.
export default function FeedbackInbox() {
  const { t, errText, lang } = useI18n()
  const [filter, setFilter] = useState('')
  const [items, setItems] = useState(null)
  const [counts, setCounts] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [busy, setBusy] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState(null)
  const fmt = (d) => new Date(d).toLocaleString(lang === 'en' ? undefined : lang)

  const load = useCallback(() => {
    api.feedbackInbox(filter).then((d) => { setItems(d); setError(null) }).catch(setError)
    api.feedbackSummary().then(setCounts).catch(() => {})
  }, [filter])
  useEffect(() => { load() }, [load])

  const patchLocal = (u) => setItems((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)))

  // opening an item = reading it: new feedback becomes "reviewed"
  async function open(f) {
    const next = openId === f.id ? null : f.id
    setOpenId(next)
    if (next && f.status === 'pending') {
      try { patchLocal(await api.updateFeedback(f.id, { status: 'reviewed' })); api.feedbackSummary().then(setCounts).catch(() => {}) } catch (e) { setError(e) }
    }
  }

  async function sendReply(f) {
    const text = (drafts[f.id] || '').trim()
    if (!text) return
    setBusy(f.id); setNotice(''); setError(null)
    try {
      patchLocal(await api.updateFeedback(f.id, { reply: text }))
      setDrafts((d) => ({ ...d, [f.id]: '' }))
      setNotice('fbk.replySent')
      api.feedbackSummary().then(setCounts).catch(() => {})
    } catch (e) { setError(e) } finally { setBusy(null) }
  }

  async function setStatus(f, status) {
    try { patchLocal(await api.updateFeedback(f.id, { status })); api.feedbackSummary().then(setCounts).catch(() => {}) } catch (e) { setError(e) }
  }

  return (
    <section className="page">
      <h1>{t('fbk.title.admin')}</h1>
      <p className="lead">{t('fbk.lead.admin')}</p>

      <div className="toolbar">
        <div className="tabs" role="tablist" style={{ margin: 0, border: 0 }}>
          {FILTERS.map((s) => (
            <button key={s || 'all'} role="tab" aria-selected={filter === s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
              {t(s ? `fbk.s.${s}` : 'fbk.filter.all')}{counts && s ? <small>{counts[s]}</small> : counts ? <small>{counts.total}</small> : null}
            </button>
          ))}
        </div>
        <button className="btn ghost sm" onClick={load}>{t('fbk.refresh')}</button>
      </div>

      {notice && <p className="notice" role="status">{t(notice)}</p>}
      {error && <p className="alert error" role="alert">{errText(error)}</p>}
      {items && !items.length && <p className="muted">{t('fbk.empty')}</p>}

      <div className="fb-list">
        {(items || []).map((f) => {
          const isOpen = openId === f.id
          return (
            <article key={f.id} className={'card fb' + (f.status === 'pending' ? ' unread' : '')}>
              <button className="fb-head" onClick={() => open(f)} aria-expanded={isOpen}>
                <span className="grow">
                  <b>{f.farmer_name}</b> <span className="muted sm">· {f.farmer_email}</span>
                  <span className="muted sm block">{fmt(f.created_at)}</span>
                </span>
                {f.replied_at && <span className="pill replied">{t('fbk.reply')} ✓</span>}
                <StatusBadge status={f.status} />
              </button>

              {!isOpen && <p className="preview">{f.is_correct !== null && f.is_correct !== undefined ? (f.is_correct ? '✓ ' : '✗ ') : ''}{f.message}</p>}

              {isOpen && (
                <div className="fb-open">
                  <FeedbackBody f={f} />
                  {f.admin_note && (
                    <div className="reply-box">
                      <p className="eyebrow sm">{t('fbk.yourReply')}{f.replied_at ? ` · ${fmt(f.replied_at)}` : ''}</p>
                      <p className="msg">{f.admin_note}</p>
                    </div>
                  )}
                  <label className="field">
                    <span>{t('fbk.reply')}</span>
                    <textarea rows={3} maxLength={2000} value={drafts[f.id] || ''} placeholder={t('fbk.replyPlaceholder')} onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))} />
                  </label>
                  <div className="row">
                    <button className="btn primary" disabled={busy === f.id || !(drafts[f.id] || '').trim()} onClick={() => sendReply(f)}>{busy === f.id ? t('fb.saving') : t('fbk.sendReply')}</button>
                    {f.status !== 'resolved'
                      ? <button className="btn outline" onClick={() => setStatus(f, 'resolved')}>{t('fbk.markResolved')}</button>
                      : <button className="btn ghost" onClick={() => setStatus(f, 'reviewed')}>{t('fbk.reopen')}</button>}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
