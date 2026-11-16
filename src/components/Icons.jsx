const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const mk = (children) => (p) => <svg {...base} {...p}>{children}</svg>

export const Leaf = mk(<><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19 14 10" /></>)
export const Upload = mk(<><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5" /><path d="M12 12v8M9 15l3-3 3 3" /></>)
export const Folder = mk(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />)
export const Camera = mk(<><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>)
export const Sun = mk(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>)
export const Sprout = mk(<><path d="M12 21v-9" /><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6ZM12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5Z" /></>)
export const Info = mk(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>)
export const Check = mk(<path d="m5 12.5 4.5 4.5L19 7.5" />)
export const Database = mk(<><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>)
export const Arrow = mk(<path d="M5 12h14M13 6l6 6-6 6" />)
export const Warn = mk(<><path d="M12 3 2.5 20h19Z" /><path d="M12 10v4M12 17v.01" /></>)
export const Trash = mk(<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />)

export function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M30 56C16 49 9 35 13 16c16 0 25 12 17 40Z" fill="#1f4a3f" />
      <path d="M34 56c14-7 21-21 17-40-16 0-25 12-17 40Z" fill="#2f6b57" />
    </svg>
  )
}
