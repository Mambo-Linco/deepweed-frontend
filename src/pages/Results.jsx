import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Check, Warn } from '../components/Icons.jsx'
import HerbicideCard from '../components/HerbicideCard.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { api } from '../lib/api.js'
import { parseSpecies } from '../lib/names.js'

function HerbicideCards({ list }) {
  const { t } = useI18n()
  if (!list.length) {
    return (
      <div className="card empty">
        <p><b>{t('results.noneTitle')}</b></p>
        <p className="muted">{t('results.noneBody')}</p>
      </div>
    )
  }
  return (
    <div className="herb-grid">
      {list.map((h) => <HerbicideCard key={h.id} h={h} />)}
    </div>
  )
}

export default function Results() {
  const { result, crop, feedbackDone, patch, reset } = useIdentify()
  const { user } = useAuth()
  const { t, errText } = useI18n()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [verdict, setVerdict] = useState(null) // true | false
  const [correctIdx, setCorrectIdx] = useState('top')
  const [other, setOther] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [scanId, setScanId] = useState(null)

  if (!result) return <Navigate to="/identify/upload" replace />

  const m = result.top3[tab]
  const s = parseSpecies(m.class_name)
  const top = result.top3[0]

  // 14–15: storeFeedback → saveToDatabase  (16–17: confirmation → displayConfirmation)
  async function ensureScan() {
    if (scanId) return scanId
    const scan = await api.saveScan({
      weed_name: top.class_name,
      confidence: top.confidence,
      crop_type: crop || user?.primary_crop || 'Unknown',
      recommendations: top.herbicides.map((h) => `${h.herbicide_name} — ${h.dosage}`),
      top3: result.top3.map((x) => ({ class_name: x.class_name, confidence: x.confidence })),
    })
    setScanId(scan.id)
    return scan.id
  }

  async function submit() {
    setBusy(true)
    setError('')
    try {
      const id = await ensureScan()
      let corrected
      if (verdict === false) {
        corrected = correctIdx === 'other' ? other.trim() : correctIdx === 'top' ? undefined : result.top3[Number(correctIdx)].class_name
      }
      await api.sendFeedback({
        is_correct: verdict,
        scan_id: id,
        corrected_weed_name: corrected || undefined,
        message: note.trim() || undefined,
      })
      patch({ feedbackDone: true })
    } catch (e) {
      setError(errText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="results">
      <p className="eyebrow"><b>07 /</b> {t('results.eyebrow')}</p>
      <h1>{parseSpecies(top.class_name).common}</h1>
      <p className="lead">
        {t('results.best', { pct: top.confidence.toFixed(1) })}
        {result.low_confidence && <> — <span className="warn-text">{t('results.low')}</span></>}.
      </p>

      <div className="tabs" role="tablist">
        {result.top3.map((x, i) => (
          <button key={x.class_index} role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>
            {x.rank}. {parseSpecies(x.class_name).common} <small>{x.confidence.toFixed(1)}%</small>
          </button>
        ))}
      </div>

      <div className="species-head">
        <h2>{s.common}</h2>
        <p className="muted">{[s.detail, s.local].filter(Boolean).join(' · ')}</p>
      </div>
      <h3>{t('results.herbTitle')}</h3>
      <HerbicideCards list={m.herbicides} />
      <p className="alert info"><Warn width={18} height={18} /> {t('results.guidance')}</p>

      <div className="card feedback">
        {feedbackDone ? (
          <div className="confirm">
            <span className="badge lg ok"><Check width={30} height={30} strokeWidth={2.4} /></span>
            <div>
              <h3>{t('fb.thanks')}</h3>
              <p className="muted">{t('fb.thanksSub')} <Link to="/history">{t('nav.myScans')}</Link>.</p>
            </div>
          </div>
        ) : !user ? (
          <>
            <h3>{t('fb.title')}</h3>
            <p className="muted">{t('fb.signinPrompt')}</p>
            <div className="row">
              <Link to="/login" state={{ from: '/identify/results' }} className="btn primary">{t('nav.signIn')}</Link>
              <Link to="/register" state={{ from: '/identify/results' }} className="btn outline">{t('nav.createAccount')}</Link>
            </div>
          </>
        ) : (
          <>
            <h3>{t('fb.title')}</h3>
            <div className="row">
              <button className={'btn ' + (verdict === true ? 'primary' : 'outline')} onClick={() => setVerdict(true)}>{t('fb.yes')}</button>
              <button className={'btn ' + (verdict === false ? 'primary' : 'outline')} onClick={() => setVerdict(false)}>{t('fb.no')}</button>
            </div>
            {verdict === false && (
              <label className="field">
                <span>{t('fb.whatIs')}</span>
                <select value={correctIdx} onChange={(e) => setCorrectIdx(e.target.value)}>
                  <option value="top">{t('fb.notSure')}</option>
                  {result.top3.slice(1).map((x, i) => <option key={x.class_index} value={i + 1}>{parseSpecies(x.class_name).common}</option>)}
                  <option value="other">{t('fb.else')}</option>
                </select>
              </label>
            )}
            {verdict === false && correctIdx === 'other' && (
              <label className="field"><span>{t('fb.species')}</span><input value={other} maxLength={200} onChange={(e) => setOther(e.target.value)} /></label>
            )}
            {verdict !== null && (
              <label className="field"><span>{t('fb.comment')} <em>{t('common.optional')}</em></span><textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></label>
            )}
            {error && <p className="alert error" role="alert">{error}</p>}
            <button className="btn primary" disabled={verdict === null || busy} onClick={submit}>{busy ? t('fb.saving') : t('fb.submit')}</button>
          </>
        )}
      </div>

      <div className="row end">
        <button className="btn outline" onClick={() => { reset(); navigate('/identify/upload') }}>{t('results.another')}</button>
      </div>
    </section>
  )
}
