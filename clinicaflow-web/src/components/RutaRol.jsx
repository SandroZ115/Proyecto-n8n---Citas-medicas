import { Navigate } from 'react-router-dom'

const PERMISOS = {
  nueva: ['secretaria', 'doctor', 'admin'],
  aprobar: ['doctor'],
  'crear-usuario': ['admin'],
  desbloquear: ['admin'],
  usuarios: ['admin'],
  reportes: ['admin'],
}

export default function RutaRol({ permiso, children }) {
  const rol = sessionStorage.getItem('rol')

  if (!PERMISOS[permiso]?.includes(rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
