import heroImg from '../assets/hero-weed.jpg'

// Shared frame for the numbered identify screens (01 Upload ... 06 Database lookup).
export default function StepShell({ num, from, title, subtitle, note, children, art = true }) {
  return (
    <section className={'shell' + (art ? ' with-art' : '')}>
      <div className="shell-main">
        <p className="eyebrow">
          <b>{num} /</b> {from}
        </p>
        <h1>{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
        {note && <p className="lead sm">{note}</p>}
        {children}
      </div>
      {art && (
        <aside className="shell-art" aria-hidden="true">
          <img src={heroImg} alt="" />
        </aside>
      )}
    </section>
  )
}
