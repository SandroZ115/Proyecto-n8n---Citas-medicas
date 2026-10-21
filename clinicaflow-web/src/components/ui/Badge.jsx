import './ui.css'

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const clases = ['ui-badge', `ui-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return <span className={clases}>{children}</span>
}
