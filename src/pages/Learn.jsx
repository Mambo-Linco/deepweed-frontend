import { Link } from 'react-router-dom'
import classNames from '../assets/class_names.json'
import { parseSpecies } from '../lib/names.js'
import { useI18n } from '../lib/i18n.jsx'

export default function Learn() {
  const { t } = useI18n()
  return (
    <section className="page">
      <h1>{t('learn.title')}</h1>
      <p className="lead">{t('learn.lead')}</p>

      <ol className="flow">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}><b>{n}</b><div><h4>{t(`learn.f${n}`)}</h4><p className="muted sm">{t(`learn.f${n}d`)}</p></div></li>
        ))}
      </ol>

      <h2>{t('learn.species', { n: classNames.length })}</h2>
      <ul className="species-list">
        {classNames.map((n) => {
          const s = parseSpecies(n)
          return (
            <li key={n}>
              <b>{s.common}</b>
              {(s.detail || s.local) && <small>{[s.detail, s.local].filter(Boolean).join(' · ')}</small>}
            </li>
          )
        })}
      </ul>

      <p className="muted">{t('learn.try')} <Link to="/identify/upload">{t('learn.tryLink')}</Link>.</p>
    </section>
  )
}
