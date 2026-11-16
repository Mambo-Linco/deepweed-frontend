import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { CROPS } from './Review.jsx'
import classNames from '../assets/class_names.json'

const EMPTY = {
  weed_name: '', herbicide_name: '', active_ingredient: '', crop: '', dosage: '',
  application_method: '', application_timing: '', mode_of_action: '', pre_harvest_interval: '', safety_notes: '',
}
const FIELDS = Object.keys(EMPTY)

// Add (/herbicides/new) and edit (/herbicides/:id/edit) a herbicide record in the database. Admin only.
export default function HerbicideForm() {
  const { id } = useParams()
  const editing = !!id
  const { user, loading } = useAuth()
  const { t, errText, cropLabel } = useI18n()
  const navigate = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [loadingRec, setLoadingRec] = useState(editing)
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!editing || !isAdmin) return
    api.herbicide(id)
      .then((h) => setF(Object.fromEntries(FIELDS.map((k) => [k, h[k] ?? '']))))
      .catch((e) => setError(e.status === 404 ? t('herbadmin.notFound') : errText(e)))
      .finally(() => setLoadingRec(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin])

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (editing) await api.updateHerbicide(id, f)
      else await api.createHerbicide(f)
      navigate('/herbicides', { state: { notice: 'herbadmin.saved' } })
    } catch (err) { setError(errText(err)) } finally { setBusy(false) }
  }

  if (loading) return <section className="page"><p className="muted">{t('common.loading')}</p></section>
  if (!user) {
    return <section className="page"><h1>{t('herbform.titleNew')}</h1><p className="lead">{t('herbadmin.signInHint')} <Link to="/login" state={{ from: editing ? `/herbicides/${id}/edit` : '/herbicides/new' }}>{t('nav.signIn')}</Link></p></section>
  }
  if (!isAdmin) return <section className="page"><h1>{t('herbform.titleNew')}</h1><p className="alert error" role="alert">{t('herbadmin.adminOnly')}</p></section>

  return (
    <section className="page wide">
      <h1>{editing ? t('herbform.titleEdit') : t('herbform.titleNew')}</h1>
      <p className="lead">{t('herbform.lead')}</p>
      {loadingRec ? <p className="muted">{t('common.loading')}</p> : (
        <form className="card form" onSubmit={submit}>
          <label className="field">
            <span>{t('herbform.weed')} <b className="req" title={t('herbform.required')}>*</b></span>
            <input required list="weed-species" maxLength={300} value={f.weed_name} onChange={set('weed_name')} />
            <datalist id="weed-species">{classNames.map((n) => <option key={n} value={n} />)}</datalist>
            <small className="hint">{t('herbform.weedHint')}</small>
          </label>

          <div className="two-col">
            <label className="field">
              <span>{t('herbform.name')} <b className="req" title={t('herbform.required')}>*</b></span>
              <input required maxLength={200} value={f.herbicide_name} onChange={set('herbicide_name')} />
            </label>
            <label className="field">
              <span>{t('herbform.active')} <em>{t('common.optional')}</em></span>
              <input maxLength={300} value={f.active_ingredient} onChange={set('active_ingredient')} />
            </label>
          </div>

          <div className="two-col">
            <label className="field">
              <span>{t('herbform.crop')} <em>{t('common.optional')}</em></span>
              <select value={f.crop} onChange={set('crop')}>
                <option value="">{t('crop.none')}</option>
                <option value="All crops">{cropLabel('All crops')}</option>
                {CROPS.map((c) => <option key={c} value={c}>{cropLabel(c)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>{t('herbform.dosage')} <b className="req" title={t('herbform.required')}>*</b></span>
              <input required maxLength={500} value={f.dosage} onChange={set('dosage')} placeholder="2L per 100L water" />
            </label>
          </div>

          <label className="field">
            <span>{t('herbform.method')} <em>{t('common.optional')}</em></span>
            <textarea rows={3} maxLength={2000} value={f.application_method} onChange={set('application_method')} />
            <small className="hint">{t('herbform.methodHint')}</small>
          </label>

          <label className="field">
            <span>{t('herbform.timing')} <em>{t('common.optional')}</em></span>
            <textarea rows={2} maxLength={1000} value={f.application_timing} onChange={set('application_timing')} />
            <small className="hint">{t('herbform.timingHint')}</small>
          </label>

          <div className="two-col">
            <label className="field">
              <span>{t('herbform.moa')} <em>{t('common.optional')}</em></span>
              <input maxLength={200} value={f.mode_of_action} onChange={set('mode_of_action')} />
              <small className="hint">{t('herbform.moaHint')}</small>
            </label>
            <label className="field">
              <span>{t('herbform.phi')} <em>{t('common.optional')}</em></span>
              <input maxLength={100} value={f.pre_harvest_interval} onChange={set('pre_harvest_interval')} />
              <small className="hint">{t('herbform.phiHint')}</small>
            </label>
          </div>

          <label className="field">
            <span>{t('herbform.safety')} <em>{t('common.optional')}</em></span>
            <textarea rows={3} maxLength={2000} value={f.safety_notes} onChange={set('safety_notes')} />
          </label>

          {error && <p className="alert error" role="alert">{error}</p>}
          <div className="row end">
            <Link to="/herbicides" className="btn ghost">{t('common.cancel')}</Link>
            <button className="btn primary" disabled={busy}>{busy ? t('fb.saving') : t('herbform.save')}</button>
          </div>
        </form>
      )}
    </section>
  )
}
