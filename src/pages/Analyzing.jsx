import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import StepShell from '../components/StepShell.jsx'
import { Check } from '../components/Icons.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { api } from '../lib/api.js'
import { prepareImage } from '../lib/image.js'

const STEP_KEYS = ['analyze.s1', 'analyze.s2', 'analyze.s3', 'analyze.s4']

export default function Analyzing() {
  const { file, previewUrl, result, patch } = useIdentify()
  const { t, errText } = useI18n()
  const navigate = useNavigate()
  const started = useRef(false)
  const [stage, setStage] = useState(0) // index of the step currently running; STEP_KEYS.length = all done
  const [pct, setPct] = useState(0)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!file || started.current) return
    started.current = true
    setError(null)
    setStage(0)
    setPct(0)
    ;(async () => {
      try {
        const blob = await prepareImage(file) // 4: preprocess(image)
        setStage(1)
        const res = await api.predict(blob)   // 3: processImage → 5–10 (model + herbicide lookup)
        setStage(2)
        await new Promise((r) => setTimeout(r, 350))
        setStage(3)
        await new Promise((r) => setTimeout(r, 350))
        setStage(STEP_KEYS.length)
        patch({ result: res })
        setTimeout(() => navigate('/identify/matches', { replace: true }), 450)
      } catch (e) {
        setError(e)
      }
    })()
  }, [file, attempt, navigate, patch])

  // cosmetic progress for the model step while we wait for the server
  useEffect(() => {
    if (stage !== 1 || error) return
    const timer = setInterval(() => setPct((p) => Math.min(p + (95 - p) * 0.08, 95)), 150)
    return () => clearInterval(timer)
  }, [stage, error])

  if (!file) return <Navigate to="/identify/upload" replace />
  if (result && stage === 0 && !error) return <Navigate to="/identify/matches" replace />

  return (
    <StepShell num="04" from={t('step.appModel')} title={t('analyze.title')} subtitle={t('analyze.subtitle')} art={false}>
      <div className="analyze-grid">
        <ol className="steps">
          {STEP_KEYS.map((k, i) => {
            const done = stage > i
            const active = stage === i && !error
            return (
              <li key={k} className={done ? 'done' : active ? 'active' : ''}>
                <span className="dot">{done ? <Check width={20} height={20} strokeWidth={2.6} /> : i + 1}</span>
                <div className="grow">
                  <b>{t(k)}</b>
                  <small>{t(`${k}d`)}</small>
                </div>
                <span className="status">
                  {done ? t('status.complete') : active ? (i === 1 ? <span className="bar"><i style={{ '--w': `${pct}%` }} /><em>{Math.round(pct)}%</em></span> : t('status.working')) : t('status.pending')}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="scan-frame">
          <img src={previewUrl} alt={t('analyze.alt')} />
          {!error && stage < STEP_KEYS.length && <><span className="scan-label">{t('analyze.scanning')}</span><span className="scan-line" /></>}
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          <p>{errText(error)}</p>
          <div className="row">
            <button className="btn primary sm" onClick={() => { started.current = false; setAttempt((a) => a + 1) }}>{t('common.tryAgain')}</button>
            <button className="btn ghost sm" onClick={() => navigate('/identify/upload')}>{t('analyze.another')}</button>
          </div>
        </div>
      )}
    </StepShell>
  )
}
