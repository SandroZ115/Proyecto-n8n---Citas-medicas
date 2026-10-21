import './ui.css'

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const clases = ['ui-btn', `ui-btn--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={clases}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="ui-btn__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
