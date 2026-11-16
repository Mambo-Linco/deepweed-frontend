import { Navigate, useNavigate } from 'react-router-dom'
import StepShell from '../components/StepShell.jsx'
import { Arrow, Check, Database } from '../components/Icons.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useI18n } from '../lib/i18n.jsx'

export default function Lookup() {
  const { result } = useIdentify()
  const { t, tn } = useI18n()
  const navigate = useNavigate()
  if (!result) return <Navigate to="/identify/upload" replace />

  const total = result.top3.reduce((n, m) => n + m.herbicides.length, 0)
  const top = result.top3[0]
  const rows = [
    [t('lookup.r1'), t('lookup.r1d')],
    [t('lookup.r2'), t('lookup.r2d', { n: result.top3.length })],
    [t('lookup.r3'), tn('lookup.r3', total)],
    [t('lookup.r4'), t('lookup.r4d')],
  ]

  return (
    <StepShell num="06" from={t('step.appDb')} title={t('lookup.title')} subtitle={t('lookup.subtitle')} art={false}>
      <div className="lookup-grid">
        <ol className="steps plain">
          {rows.map(([title, detail]) => (
            <li key={title} className="done">
              <span className="dot"><Check width={20} height={20} strokeWidth={2.6} /></span>
              <div className="grow"><b>{title}</b><small>{detail}</small></div>
            </li>
          ))}
        </ol>
        <div className="card side">
          <div className="row gap">
            <span className="badge lg"><Database width={30} height={30} /></span>
            <h3>{t('lookup.connected')}</h3>
          </div>
          <p className="muted">
            {top.herbicides.length ? tn('lookup.some', top.herbicides.length) : t('lookup.none')}
          </p>
          <p className="muted">{t('lookup.disclaimer')}</p>
          <button className="btn primary block" onClick={() => navigate('/identify/results')}>
            {t('lookup.view')} <Arrow width={20} height={20} />
          </button>
        </div>
      </div>
    </StepShell>
  )
}
