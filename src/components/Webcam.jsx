import { useEffect, useRef, useState } from 'react'
import { Camera } from './Icons.jsx'
import { useI18n } from '../lib/i18n.jsx'

// Step 1: capturePhoto()
export default function Webcam({ onCapture, onClose }) {
  const { t } = useI18n()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('cam.unsupported')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (cancelled) return stream.getTracks().forEach((tr) => tr.stop())
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
          setReady(true)
        }
      } catch {
        setError('cam.denied')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
    }
  }, [])

  function snap() {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob((blob) => {
      if (blob) onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t('cam.title')}>
      <div className="modal-card">
        {error ? (
          <p className="alert error">{t(error)}</p>
        ) : (
          <video ref={videoRef} playsInline muted className="cam" />
        )}
        <div className="row end">
          <button className="btn ghost" onClick={onClose}>{t('common.cancel')}</button>
          {!error && (
            <button className="btn primary" onClick={snap} disabled={!ready}>
              <Camera width={18} height={18} /> {t('cam.take')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
