import { useI18n } from '../lib/i18n.jsx'
import { displayName } from '../lib/names.js'
import { confPct, isDefaultMessage } from '../lib/feedbackText.js'

export function StatusBadge({ status }) {
  const { t } = useI18n()
  return <span className={`pill ${status}`}>{t(`fbk.s.${status}`)}</span>
}

// The farmer's side of one feedback item: verdict, suggested species, message and the scan it refers to.
export function FeedbackBody({ f, mine = false }) {
  const { t, cropLabel } = useI18n()
  return (
    <>
      {f.is_correct !== null && f.is_correct !== undefined && (
        <p className={'verdict ' + (f.is_correct ? 'ok' : 'bad')}>{f.is_correct ? '✓ ' : '✗ '}{t(f.is_correct ? 'fbk.correct' : 'fbk.incorrect')}</p>
      )}
      {f.corrected_weed_name && <p><b>{t(mine ? 'fbk.suggestedMine' : 'fbk.suggested', { name: displayName(f.corrected_weed_name) })}</b></p>}
      {!isDefaultMessage(f.message) && <p className="msg">{f.message}</p>}
      {f.scan_weed_name && (
        <p className="muted sm">{t('fbk.scanLine', { weed: displayName(f.scan_weed_name), pct: confPct(f.scan_confidence), crop: cropLabel(f.scan_crop_type) })}</p>
      )}
    </>
  )
}
