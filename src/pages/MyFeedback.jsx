import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import { FeedbackBody, StatusBadge } from '../components/FeedbackCommon.jsx'

// Farmer: send a message to the administrators and read their replies.
export default function MyFeedback() {
  const { t, errText, lang } = useI18n()
  const [items, setItems] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState(null)
  const fmt = (d) => new Date(d).toLocaleString(lang === 'en' ? undefined : lang)

  const load = useCallback(() => api.myFeedback().then((d) => { setItems(d); setError(null) }).catch(setError), [])
  useEffect(() => { load() }, [load])

  // viewing the page = reading the replies
  useEffect(() => {
    if (!items) return
    const unread = items.filter((f) => f.replied_at && !f.reply_seen_at)
    if (!unread.length) return
    Promise.all(unread.map((f) => api.markReplySeen(f.id).catch(() => null))).then(() => window.dispatchEvent(new Event('deepweed:feedback-seen')))
  }, [items])

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true); setError(null); setNotice('')
    try {
      await api.sendFeedback({ message: text.trim() })
      setText(''); setNotice('fbk.newSent'); load()
    } catch (err) { setError(err) } finally { setBusy(false) }
  }

  return (
    <section className="page">
      <h1>{t('fbk.title.mine')}</h1>
      <p className="lead">{t('fbk.lead.mine')}</p>

      <form className="card form" onSubmit={send}>
        <h3>{t('fbk.newTitle')}</h3>
        <label className="field">
          <span className="sr-only">{t('fbk.yourMessage')}</span>
          <textarea rows={3} maxLength={2000} value={text} placeholder={t('fbk.newPlaceholder')} onChange={(e) => setText(e.target.value)} />
        </label>
        <button className="btn primary" disabled={busy || !text.trim()}>{busy ? t('fb.saving') : t('fbk.newSend')}</button>
      </form>

      {notice && <p className="notice" role="status">{t(notice)}</p>}
      {error && <p className="alert error" role="alert">{errText(error)}</p>}
      {items && !items.length && <p className="muted">{t('fbk.empty')}</p>}

      <div className="fb-list">
        {(items || []).map((f) => (
          <article key={f.id} className="card fb">
            <div className="fb-head static">
              <span className="grow muted sm">{t('fbk.sentOn', { date: fmt(f.created_at) })}</span>
              {f.replied_at && !f.reply_seen_at && <span className="pill pending">{t('fbk.newReply')}</span>}
              <StatusBadge status={f.status} />
            </div>
            <FeedbackBody f={f} mine />
            {f.admin_note ? (
              <div className="reply-box">
                <p className="eyebrow sm">{t('fbk.adminReply')}{f.replied_at ? ` · ${fmt(f.replied_at)}` : ''}</p>
                <p className="msg">{f.admin_note}</p>
              </div>
            ) : <p className="muted sm">{t('fbk.noReply')}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
