import { notificarSesionVencida } from './sesion'

const BASE = '/api'

async function request(url, { method = 'GET', headers = {}, body, sinSesion = false } = {}) {
  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { ok: false, status: 0, data: null }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (res.status === 401 && !sinSesion) {
    notificarSesionVencida()
  }

  return { ok: res.ok, status: res.status, data }
}

export function login(correo, password, codigo_totp) {
  return request(`${BASE}/login`, {
    method: 'POST',
    body: { correo, password, codigo_totp },
    sinSesion: true,
  })
}

export function verificarSesion(token) {
  return request(`${BASE}/verificar-sesion`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

function tokenActual() {
  return sessionStorage.getItem('token')
}

export function doctoresDisponibles({ especialidad_id, fecha_hora }) {
  return request(`${BASE}/doctores-disponibles`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: { especialidad_id, fecha_hora },
  })
}

export function crearCita({
  nombre_paciente,
  especialidad_id,
  urgencia,
  doctor_id,
  fecha_hora,
  codigo_totp,
}) {
  return request(`${BASE}/crear-cita`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: { nombre_paciente, especialidad_id, urgencia, doctor_id, fecha_hora, codigo_totp },
  })
}

export function agenda(payload) {
  return request(`${BASE}/agenda`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: payload,
  })
}

export function listarPendientes() {
  return request(`${BASE}/listar-citas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
  })
}

export function aprobarCita(cita_id, codigo_totp) {
  return request(`${BASE}/aprobar-cita`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: { cita_id, codigo_totp },
    sinSesion: true,
  })
}

export function listarEspecialidades() {
  return request(`${BASE}/listar-especialidades`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
  })
}

export function adminEspecialidades(payload) {
  return request(`${BASE}/admin-especialidades`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: payload,
  })
}

export function registrarUsuario({ correo, password, rol, especialidad_id }) {
  const body = { correo, password, rol }
  if (rol === 'doctor') {
    body.especialidad_id = especialidad_id
  }

  return request(`${BASE}/registro-usuario`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body,
  })
}

export function desbloquearUsuario(correo) {
  return request(`${BASE}/admin-desbloquear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: { correo },
  })
}

export function adminUsuarios(payload) {
  return request(`${BASE}/admin-usuarios`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body: payload,
  })
}

export function reporteMensual({ mes, tipo, usuario_id } = {}) {
  const body = { mes, tipo }

  if (usuario_id !== undefined && usuario_id !== null && Number(usuario_id) !== 0) {
    body.usuario_id = Number(usuario_id)
  }

  return request(`${BASE}/reporte-mensual`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenActual()}` },
    body,
  })
}
