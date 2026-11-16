import { useI18n } from '../lib/i18n.jsx'

export default function Resistance() {
  const { t } = useI18n()
  return (
    <section className="page">
      <h1>{t('res.title')}</h1>
      <p className="lead">{t('res.lead')}</p>
      <div className="tip-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <article key={n} className="card">
            <p className="eyebrow sm"><b>{String(n).padStart(2, '0')}</b></p>
            <h3>{t(`res.t${n}`)}</h3>
            <p className="muted">{t(`res.d${n}`)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
