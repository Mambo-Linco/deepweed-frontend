import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import FeedbackInbox from './FeedbackInbox.jsx'
import MyFeedback from './MyFeedback.jsx'

// /feedback: admins get the inbox, farmers get their own messages and the replies.
export default function Feedback() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  if (loading) return <section className="page"><p className="muted">{t('common.loading')}</p></section>
  if (!user) {
    return <section className="page"><h1>{t('fbk.title.mine')}</h1><p className="lead">{t('fbk.signin')} <Link to="/login" state={{ from: '/feedback' }}>{t('nav.signIn')}</Link>.</p></section>
  }
  return user.role === 'admin' ? <FeedbackInbox /> : <MyFeedback />
}
