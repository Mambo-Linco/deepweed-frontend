import { Navigate, useNavigate } from 'react-router-dom'
import StepShell from '../components/StepShell.jsx'
import { Arrow, Leaf, Warn } from '../components/Icons.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { parseSpecies } from '../lib/names.js'

export default function Matches() {
  const { result, previewUrl } = useIdentify()
  const { t } = useI18n()
  const navigate = useNavigate()
  if (!result) return <Navigate to="/identify/upload" replace />

  return (
    <StepShell num="05" from={t('step.modelApp')} title={t('matches.title')} subtitle={t('matches.subtitle')} art={false}>
      {result.low_confidence && (
        <p className="alert warn" role="status">
          <Warn width={20} height={20} /> {t('matches.lowConf')}
        </p>
      )}
      <div className="match-grid">
        {result.top3.map((m, i) => {
          const s = parseSpecies(m.class_name)
          return (
            <article key={m.class_index} className={'match' + (i === 0 ? ' first' : '')}>
              <div className="thumb">
                <span className="rank">{m.rank}</span>
                {i === 0 ? <img src={previewUrl} alt={t('matches.yourPhoto')} /> : <Leaf width={56} height={56} strokeWidth={1.2} />}
              </div>
              <div className="body">
                <h3>{s.common}</h3>
                {(s.detail || s.local) && <p className="muted sm"><i>{s.detail}</i>{s.detail && s.local ? ' · ' : ''}{s.local}</p>}
                <p className="score"><b>{m.confidence.toFixed(1)}%</b> <span>{t('matches.confidence')}</span></p>
                <div className="meter"><i style={{ width: `${Math.max(2, m.confidence)}%` }} /></div>
              </div>
            </article>
          )
        })}
      </div>
      <button className="btn primary xl" onClick={() => navigate('/identify/lookup')}>
        {t('matches.next')} <Arrow width={20} height={20} />
      </button>
    </StepShell>
  )
}
