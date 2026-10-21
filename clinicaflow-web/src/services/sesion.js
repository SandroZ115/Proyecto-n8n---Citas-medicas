export const EVENTO_SESION_VENCIDA = 'app:sesion-vencida'

export function notificarSesionVencida() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA))
}

export function cerrarSesionVencida(navigate) {
  sessionStorage.clear()
  navigate('/', { replace: true, state: { vencida: true } })
}
