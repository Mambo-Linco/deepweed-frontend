import { Navigate, useNavigate } from 'react-router-dom'
import StepShell from '../components/StepShell.jsx'
import { Arrow, Camera, Leaf } from '../components/Icons.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'

// Values are sent to the API in English; only the labels are translated (crop.<value>).
export const CROPS = ['Maize', 'Tobacco', 'Cotton', 'Soybean', 'Groundnuts', 'Sorghum', 'Wheat', 'Vegetables', 'Other']

export default function Review() {
  const { file, previewUrl, crop, patch } = useIdentify()
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  if (!file) return <Navigate to="/identify/upload" replace />

  const selectedCrop = crop || user?.primary_crop || ''

  return (
    <StepShell num="02" from={t('step.farmerApp')} title={t('review.title')} subtitle={t('review.subtitle')} art={false}>
      <div className="review-grid">
        <div className="photo-frame">
          <img src={previewUrl} alt={t('review.alt')} />
          <button className="btn light float" onClick={() => navigate('/identify/upload')}>
            <Camera width={20} height={20} /> {t('review.change')}
          </button>
        </div>
        <div className="card side">
          <div className="row gap">
            <span className="badge lg"><Leaf width={30} height={30} /></span>
            <div>
              <h3>{t('review.selected')}</h3>
              <p className="muted">{t('review.sent')}</p>
            </div>
          </div>
          <hr />
          <label className="field">
            <span>{t('review.crop')} <em>{t('common.optional')}</em></span>
            <select value={selectedCrop} onChange={(e) => patch({ crop: e.target.value })}>
              <option value="">{t('crop.none')}</option>
              {CROPS.map((c) => <option key={c} value={c}>{t(`crop.${c}`)}</option>)}
            </select>
          </label>
          <button className="btn primary block" onClick={() => navigate('/identify/analyzing')}>
            {t('review.continue')} <Arrow width={20} height={20} />
          </button>
        </div>
      </div>
    </StepShell>
  )
}
