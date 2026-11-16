import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { CROPS } from './Review.jsx'

function useAfterAuth() {
  const { state } = useLocation()
  const navigate = useNavigate()
  return () => navigate(state?.from || '/identify/upload', { replace: true })
}

export function Login() {
  const { login } = useAuth()
  const { t, errText } = useI18n()
  const location = useLocation()
  const done = useAfterAuth()
  const [f, setF] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await login(f.email.trim(), f.password); done() } catch (err) { setError(errText(err)) } finally { setBusy(false) }
  }

  return (
    <section className="page narrow">
      <h1>{t('auth.signinTitle')}</h1>
      <form className="card form" onSubmit={submit}>
        <label className="field"><span>{t('auth.email')}</span><input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="field"><span>{t('auth.password')}</span><input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="btn primary block" disabled={busy}>{busy ? t('auth.signingIn') : t('auth.signinTitle')}</button>
        <p className="muted sm">{t('auth.noAccount')} <Link to="/register" state={location.state}>{t('auth.createOne')}</Link></p>
      </form>
    </section>
  )
}

export function Register() {
  const { register } = useAuth()
  const { t, errText } = useI18n()
  const location = useLocation()
  const done = useAfterAuth()
  const [f, setF] = useState({ first_name: '', last_name: '', email: '', password: '', farm_location: '', primary_crop: 'Maize' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const body = { ...f, email: f.email.trim() }
    if (!body.farm_location.trim()) delete body.farm_location
    try { await register(body); done() } catch (err) { setError(errText(err)) } finally { setBusy(false) }
  }

  return (
    <section className="page narrow">
      <h1>{t('auth.registerTitle')}</h1>
      <form className="card form" onSubmit={submit}>
        <div className="two">
          <label className="field"><span>{t('auth.first')}</span><input required value={f.first_name} onChange={set('first_name')} /></label>
          <label className="field"><span>{t('auth.last')}</span><input required value={f.last_name} onChange={set('last_name')} /></label>
        </div>
        <label className="field"><span>{t('auth.email')}</span><input type="email" required autoComplete="email" value={f.email} onChange={set('email')} /></label>
        <label className="field"><span>{t('auth.password')} <em>{t('auth.passwordHint')}</em></span><input type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} /></label>
        <label className="field"><span>{t('auth.farm')} <em>{t('common.optional')}</em></span><input value={f.farm_location} onChange={set('farm_location')} /></label>
        <label className="field"><span>{t('auth.crop')}</span>
          <select value={f.primary_crop} onChange={set('primary_crop')}>{CROPS.map((c) => <option key={c} value={c}>{t(`crop.${c}`)}</option>)}</select>
        </label>
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="btn primary block" disabled={busy}>{busy ? t('auth.creating') : t('nav.createAccount')}</button>
        <p className="muted sm">{t('auth.haveAccount')} <Link to="/login" state={location.state}>{t('nav.signIn')}</Link></p>
      </form>
    </section>
  )
}
