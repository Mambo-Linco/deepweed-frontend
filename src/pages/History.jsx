import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash } from '../components/Icons.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { displayName } from '../lib/names.js'

export default function History() {
  const { user, loading } = useAuth()
  const { t, errText, lang } = useI18n()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => api.scans(50).then(setData).catch((e) => setError(e)), [])
  useEffect(() => { if (user) load() }, [user, load])

  if (loading) return <section className="page"><p className="muted">{t('common.loading')}</p></section>
  if (!user) return <section className="page"><h1>{t('history.title')}</h1><p className="lead">{t('history.needSignIn')} <Link to="/login" state={{ from: '/history' }}>{t('nav.signIn')}</Link>.</p></section>

  async function remove(id) {
    try { await api.deleteScan(id); load() } catch (e) { setError(e) }
  }

  return (
    <section className="page">
      <h1>{t('history.title')}</h1>
      {error && <p className="alert error" role="alert">{errText(error)}</p>}
      {data && !data.data.length && <p className="lead">{t('history.empty')} <Link to="/identify/upload">{t('history.emptyLink')}</Link></p>}
      <div className="scan-list">
        {data?.data.map((s) => (
          <article key={s.id} className="card scan">
            <div className="grow">
              <h3>{displayName(s.weed_name)}</h3>
              <p className="muted sm">{Number(s.confidence).toFixed(1)}% · {t(`crop.${s.crop_type}`) === `crop.${s.crop_type}` ? s.crop_type : t(`crop.${s.crop_type}`)} · {new Date(s.created_at).toLocaleString(lang === 'en' ? undefined : lang)}</p>
              {s.recommendations?.length > 0 && <p className="sm">{s.recommendations.join(' · ')}</p>}
            </div>
            <button className="btn ghost sm" onClick={() => remove(s.id)} aria-label={t('common.delete')}><Trash width={18} height={18} /></button>
          </article>
        ))}
      </div>
    </section>
  )
}
