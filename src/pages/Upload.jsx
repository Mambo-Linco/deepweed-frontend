import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepShell from '../components/StepShell.jsx'
import Webcam from '../components/Webcam.jsx'
import { Camera, Folder, Sprout, Sun, Leaf, Upload as UploadIcon } from '../components/Icons.jsx'
import { useIdentify } from '../lib/identify.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { validateFile } from '../lib/image.js'

export default function Upload() {
  const { setFile } = useIdentify()
  const { t } = useI18n()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('') // an i18n key
  const [cam, setCam] = useState(false)

  function accept(file) {
    const problem = validateFile(file)
    if (problem) return setError(problem)
    setError('')
    setFile(file)
    navigate('/identify/review') // 2: uploadImage(image)
  }

  return (
    <StepShell num="01" from={t('step.farmerApp')} title={t('upload.title')} subtitle={t('upload.subtitle')}>
      <div className="upload-grid">
        <div
          className={'dropzone' + (drag ? ' drag' : '')}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files?.[0]) }}
        >
          <UploadIcon width={64} height={64} strokeWidth={1.4} />
          <h3>{t('upload.drop')}</h3>
          <p className="muted">{t('upload.formats')}</p>
          <div className="row center">
            <button className="btn primary" onClick={() => inputRef.current?.click()}>
              <Folder width={20} height={20} /> {t('upload.browse')}
            </button>
            <button className="btn outline" onClick={() => setCam(true)}>
              <Camera width={20} height={20} /> {t('upload.webcam')}
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { accept(e.target.files?.[0]); e.target.value = '' }} />
        </div>

        <div className="tips card">
          <h3>{t('upload.tips')}</h3>
          <ul>
            <li><span className="badge"><Sun width={22} height={22} /></span><div><b>{t('tip.lit')}</b><small>{t('tip.litSub')}</small></div></li>
            <li><span className="badge"><Sprout width={22} height={22} /></span><div><b>{t('tip.whole')}</b><small>{t('tip.wholeSub')}</small></div></li>
            <li><span className="badge"><Leaf width={22} height={22} /></span><div><b>{t('tip.detail')}</b><small>{t('tip.detailSub')}</small></div></li>
          </ul>
        </div>
      </div>
      {error && <p className="alert error" role="alert">{t(error)}</p>}
      {cam && <Webcam onClose={() => setCam(false)} onCapture={(f) => { setCam(false); accept(f) }} />}
    </StepShell>
  )
}
