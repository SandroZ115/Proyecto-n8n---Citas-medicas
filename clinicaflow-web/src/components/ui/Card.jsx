import './ui.css'

export default function Card({ children, className = '', ...props }) {
  const clases = ['ui-card', className].filter(Boolean).join(' ')

  return (
    <div className={clases} {...props}>
      {children}
    </div>
  )
}
