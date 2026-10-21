import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { verificarSesion } from '../services/api'

export default function RutaProtegida({ children }) {
  const token = sessionStorage.getItem('token')
  const [verificando, setVerificando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    let activo = true

    if (!token) {
      setVerificando(false)
      setAutorizado(false)
      return
    }

    verificarSesion(token).then(({ status }) => {
      if (!activo) return
      if (status === 401) {
        sessionStorage.clear()
        setAutorizado(false)
      } else {
        setAutorizado(true)
      }
      setVerificando(false)
    })

    return () => {
      activo = false
    }
  }, [token])

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (verificando) {
    return null
  }

  if (!autorizado) {
    return <Navigate to="/" replace state={{ vencida: true }} />
  }

  return children
}
