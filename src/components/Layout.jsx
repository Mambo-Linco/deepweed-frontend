import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { Logo } from './Icons.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { api } from '../lib/api.js'

const NAV = [
  { to: '/identify', key: 'nav.identify', match: '/identify' },
  { to: '/herbicides', key: 'nav.herbicides', match: '/herbicides' },
  { to: '/resistance', key: 'nav.resistance' },
  { to: '/learn', key: 'nav.learn' },
]

export default function Layout() {
  const { user, logout, loading } = useAuth()
  const { t } = useI18n()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {window.scrollTo(0, 0)}, [pathname])

  // badge on the feedback link: admins = new feedback, farmers = unread replies
  const [badge, setBadge] = useState(0)
  const refreshBadge = useCallback(() => {
    if (!user) { setBadge(0); return }
    const p = user.role === 'admin'
      ? api.feedbackSummary().then((s) => s.pending)
      : api.myFeedback().then((l) => l.filter((f) => f.replied_at && !f.reply_seen_at).length)
    p.then(setBadge).catch(() => {})
  }, [user])
  useEffect(() => { refreshBadge() }, [refreshBadge, pathname])
  useEffect(() => {
    window.addEventListener('deepweed:feedback-seen', refreshBadge)
    return () => window.removeEventListener('deepweed:feedback-seen', refreshBadge)
  }, [refreshBadge])

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/identify/upload" className="brand" aria-label={t('nav.home')}>
          <Logo />
          <span>
            <strong>FieldGuide</strong>
            <small>{t('brand.sub')}</small>
          </span>
        </Link>

        <nav className="nav" aria-label={t('nav.main')}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => 'nav-link' + (isActive || (n.match && pathname.startsWith(n.match)) ? ' active' : '')}
            >
              {t(n.key)}
            </NavLink>
          ))}
        </nav>

        <div className="account">
          <LanguageSwitcher />
          {loading ? null : user ? (
            <>
              <Link to="/feedback" className="nav-link small">{t(user.role === 'admin' ? 'fbk.nav.inbox' : 'fbk.nav.mine')}{badge > 0 && <span className="badge-n" aria-label={`${badge}`}>{badge}</span>}</Link>
              <Link to="/history" className="nav-link small">{t('nav.myScans')}</Link>
              <span className="who" title={user.email}>{user.first_name}</span>
              <button className="btn ghost sm" onClick={() => { logout(); navigate('/identify/upload') }}>{t('nav.signOut')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost sm">{t('nav.signIn')}</Link>
              <Link to="/register" className="btn primary sm">{t('nav.createAccount')}</Link>
            </>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <span className="tag"><Logo size={26} /> {t('footer.tag')}</span>
        <span className="fine">{t('footer.fine')}</span>
      </footer>
    </div>
  )
}
