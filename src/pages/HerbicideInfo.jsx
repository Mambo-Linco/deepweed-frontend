import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import HerbicideCard from '../components/HerbicideCard.jsx'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'

export default function HerbicideInfo() {
  const { t, errText } = useI18n()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [q, setQ] = useState('')
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      api.herbicides(q.trim().toLowerCase() || undefined).then((d) => { setItems(d); setError(null) }).catch((e) => setError(e))
    }, 250)
    return () => clearTimeout(timer)
  }, [q, tick])

  // the "saved" notice arrives via router state; clear it from history so a refresh doesn't repeat it
  useEffect(() => { if (location.state?.notice) navigate(location.pathname, { replace: true, state: null }) }, [location, navigate])

  const remove = useCallback(async (h) => {
    if (!window.confirm(t('herbadmin.confirmDelete', { name: h.herbicide_name }))) return
    try {
      await api.deleteHerbicide(h.id)
      setNotice('herbadmin.deleted')
      setTick((n) => n + 1)
    } catch (e) { setError(e) }
  }, [t])

  return (
    <section className="page">
      <h1>{t('herbinfo.title')}</h1>
      <p className="lead">{t('herbinfo.lead')}</p>

      <div className="toolbar">
        <input className="search" type="search" placeholder={t('herbinfo.search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('herbinfo.searchLabel')} />
        {isAdmin && <Link to="/herbicides/new" className="btn primary">+ {t('herbadmin.add')}</Link>}
      </div>
      {!isAdmin && (
        <p className="muted sm">
          {t('herbadmin.signInHint')} {!user && <Link to="/login" state={{ from: '/herbicides' }}>{t('nav.signIn')}</Link>}
        </p>
      )}

      {notice && <p className="notice" role="status">{t(notice)}</p>}
      {error && <p className="alert error" role="alert">{errText(error)}</p>}
      {items && !items.length && <p className="muted">{t('herbinfo.none', { q })}</p>}
      {items && items.length > 0 && <p className="muted sm">{t('herbinfo.dataNote')}</p>}
      <div className="herb-grid">
        {(items || []).map((h) => (
          <HerbicideCard key={h.id} h={h} showWeed admin={isAdmin} onDelete={remove} />
        ))}
      </div>
    </section>
  )
}
