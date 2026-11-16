import { LANGUAGES, useI18n } from '../lib/i18n.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  return (
    <label className="lang">
      <span className="sr-only">{t('lang.label')}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('lang.label')}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  )
}
