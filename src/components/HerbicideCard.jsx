import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n.jsx'

// One herbicide record. Pass `admin` + `onDelete` to show Edit / Delete buttons.
export default function HerbicideCard({ h, showWeed = false, admin = false, onDelete }) {
  const { t, cropLabel } = useI18n()
  const rows = [
    ['herb.crop', h.crop && cropLabel(h.crop)],
    ['herb.timing', h.application_timing],
    ['herb.dosage', h.dosage],
    ['herb.application', h.application_method],
    ['herb.moa', h.mode_of_action],
    ['herb.phi', h.pre_harvest_interval],
    ['herb.safety', h.safety_notes],
  ].filter(([, v]) => v)

  return (
    <article className="card herb">
      {showWeed && <p className="eyebrow sm">{h.weed_name}</p>}
      <h4>{h.herbicide_name}</h4>
      {h.active_ingredient && <p className="muted sm">{h.active_ingredient}</p>}
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="kv"><dt>{t(k)}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {admin && (
        <div className="herb-actions">
          <Link to={`/herbicides/${h.id}/edit`} className="btn outline sm">{t('herbadmin.edit')}</Link>
          <button className="btn ghost sm danger" onClick={() => onDelete?.(h)}>{t('common.delete')}</button>
        </div>
      )}
    </article>
  )
}
