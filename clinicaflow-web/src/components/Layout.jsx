import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config'
import { verificarSesion } from '../services/api'
import { EVENTO_SESION_VENCIDA, cerrarSesionVencida } from '../services/sesion'
import Badge from './ui/Badge'

function IconoNuevaCita() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M12 13v4M10 15h4" />
    </svg>
  )
}

function IconoAgenda() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="12" cy="15.5" r="2.4" />
    </svg>
  )
}

function IconoAprobar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 4h6v3H9z" />
      <path d="M15 5h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  )
}

function IconoEspecialidades() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 3v5a5 5 0 0010 0V3" />
      <path d="M3.5 3h3M12.5 3h3" />
      <path d="M10 13v2a5 5 0 005 5h.5A2.5 2.5 0 0018 17.5V15" />
      <circle cx="18" cy="13" r="2" />
    </svg>
  )
}

function IconoCrearUsuario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6 1.1 0 2.1.3 3 .8" />
      <path d="M17 14v6M14 17h6" />
    </svg>
  )
}

function IconoDesbloquear() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 017.7-1.5" />
    </svg>
  )
}

function IconoUsuarios() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.3a3.5 3.5 0 010 5.4" />
      <path d="M18 14.5c1.8.9 3 2.7 3 5.5" />
    </svg>
  )
}

function IconoReportes() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h16" />
      <path d="M7.5 20v-6" />
      <path d="M12 20V6" />
      <path d="M16.5 20v-9" />
    </svg>
  )
}

function IconoMenu() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function IconoCaret() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const MENUS = {
  secretaria: [
    { to: '/dashboard/nueva', label: 'Nueva cita', Icono: IconoNuevaCita },
    { to: '/dashboard/agenda', label: 'Agenda', Icono: IconoAgenda },
  ],
  doctor: [
    { to: '/dashboard/nueva', label: 'Nueva cita', Icono: IconoNuevaCita },
    { to: '/dashboard/aprobar', label: 'Aprobar cita', Icono: IconoAprobar },
    { to: '/dashboard/agenda', label: 'Agenda', Icono: IconoAgenda },
  ],
  admin: [
    { to: '/dashboard/nueva', label: 'Nueva cita', Icono: IconoNuevaCita },
    { to: '/dashboard/especialidades', label: 'Especialidades', Icono: IconoEspecialidades },
    { to: '/dashboard/crear-usuario', label: 'Crear usuario', Icono: IconoCrearUsuario },
    { to: '/dashboard/desbloquear', label: 'Desbloquear usuario', Icono: IconoDesbloquear },
    { to: '/dashboard/usuarios', label: 'Usuarios', Icono: IconoUsuarios },
    { to: '/dashboard/reportes', label: 'Reportes', Icono: IconoReportes },
    { to: '/dashboard/agenda', label: 'Agenda', Icono: IconoAgenda },
  ],
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const rol = sessionStorage.getItem('rol')
  const items = useMemo(() => MENUS[rol] ?? [], [rol])

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [correo, setCorreo] = useState(() => sessionStorage.getItem('correo') ?? '')
  const refUsuario = useRef(null)

  useEffect(() => {
    function alVencer() {
      cerrarSesionVencida(navigate)
    }

    window.addEventListener(EVENTO_SESION_VENCIDA, alVencer)
    return () => window.removeEventListener(EVENTO_SESION_VENCIDA, alVencer)
  }, [navigate])

  useEffect(() => {
    function fueraDelBloque(evento) {
      if (refUsuario.current && !refUsuario.current.contains(evento.target)) {
        setMenuUsuarioAbierto(false)
      }
    }

    function conEscape(evento) {
      if (evento.key === 'Escape') {
        setMenuUsuarioAbierto(false)
      }
    }

    document.addEventListener('mousedown', fueraDelBloque)
    document.addEventListener('keydown', conEscape)
    return () => {
      document.removeEventListener('mousedown', fueraDelBloque)
      document.removeEventListener('keydown', conEscape)
    }
  }, [])

  useEffect(() => {
    if (correo) return

    const token = sessionStorage.getItem('token')
    if (!token) return

    let activo = true

    verificarSesion(token).then(({ status, data }) => {
      if (!activo || status !== 200) return

      const valor = data?.correo ?? ''
      if (!valor) return

      sessionStorage.setItem('correo', valor)
      setCorreo(valor)
    })

    return () => {
      activo = false
    }
  }, [correo])

  function cerrarSesion() {
    sessionStorage.clear()
    navigate('/')
  }

  const titulo = useMemo(() => {
    const opcion = items.find((item) => item.to === location.pathname)
    if (opcion) return opcion.label
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      return 'Inicio'
    }
    return APP_NAME
  }, [items, location.pathname])

  const iniciales = useMemo(() => {
    const base = correo.split('@')[0]?.trim() ?? ''
    if (!base) return ''

    const partes = base.split(/[._\-\s]+/).filter(Boolean)
    return partes
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase()
  }, [correo])

  return (
    <div className="layout">
      <aside className={`menu${menuAbierto ? ' menu--abierto' : ''}`}>
        <div className="menu-cabecera">
          <span className="menu-titulo">{APP_NAME}</span>
        </div>

        <nav className="menu-nav">
          {items.map((item) => {
            const { Icono } = item

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'menu-enlace activo' : 'menu-enlace'
                }
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  <Icono />
                </span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {menuAbierto && (
        <div
          className="menu-velo"
          role="presentation"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <div className="contenido">
        <header className="barra">
          <div className="barra-izquierda">
            <button
              type="button"
              className="boton-menu"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
            >
              <IconoMenu />
            </button>

            <h1 className="barra-titulo">{titulo}</h1>
          </div>

          <div className="barra-derecha">
            <div className="usuario" ref={refUsuario}>
              {correo && <span className="usuario-correo">{correo}</span>}

              {iniciales && (
                <span className="usuario-inicial" aria-hidden="true">
                  {iniciales}
                </span>
              )}

              <Badge variant="neutral" className="usuario-rol">
                {rol}
              </Badge>

              <button
                type="button"
                className="usuario-menu-boton"
                onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
                aria-label="Opciones de la cuenta"
                aria-haspopup="menu"
                aria-expanded={menuUsuarioAbierto}
              >
                <IconoCaret />
              </button>

              {menuUsuarioAbierto && (
                <div className="usuario-menu" role="menu">
                  <button
                    type="button"
                    className="usuario-menu-item"
                    role="menuitem"
                    onClick={cerrarSesion}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          <div className="main-contenido">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
