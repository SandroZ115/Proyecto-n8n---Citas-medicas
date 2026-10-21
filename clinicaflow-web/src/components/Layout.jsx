import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config'

const MENUS = {
  secretaria: [
    { to: '/dashboard/nueva', label: 'Nueva cita' },
    { to: '/dashboard/agenda', label: 'Agenda' },
  ],
  doctor: [
    { to: '/dashboard/nueva', label: 'Nueva cita' },
    { to: '/dashboard/aprobar', label: 'Aprobar cita' },
    { to: '/dashboard/agenda', label: 'Agenda' },
  ],
  admin: [
    { to: '/dashboard/nueva', label: 'Nueva cita' },
    { to: '/dashboard/especialidades', label: 'Especialidades' },
    { to: '/dashboard/crear-usuario', label: 'Crear usuario' },
    { to: '/dashboard/desbloquear', label: 'Desbloquear usuario' },
    { to: '/dashboard/usuarios', label: 'Usuarios' },
    { to: '/dashboard/reportes', label: 'Reportes' },
    { to: '/dashboard/agenda', label: 'Agenda' },
  ],
}

export default function Layout() {
  const navigate = useNavigate()
  const rol = sessionStorage.getItem('rol')
  const items = MENUS[rol] ?? []

  function cerrarSesion() {
    sessionStorage.clear()
    navigate('/')
  }

  return (
    <div className="layout">
      <aside className="menu">
        <h2 className="menu-titulo">{APP_NAME}</h2>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'menu-enlace activo' : 'menu-enlace'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="contenido">
        <header className="barra">
          <span className="rol">Rol: {rol}</span>
          <button className="boton-salir" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
