import './TablaResponsiva.css'

export default function TablaResponsiva({ children, className = '' }) {
  return (
    <div className={`tabla-responsiva ${className}`.trim()}>
      <div className="tabla-responsiva__contenedor">
        {children}
      </div>
    </div>
  )
}
