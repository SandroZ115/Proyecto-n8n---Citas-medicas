import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  crearCita,
  doctoresDisponibles,
  listarEspecialidades,
} from '../services/api'

const HORAS = (() => {
  const lista = []
  for (let h = 8; h <= 16; h++) {
    lista.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 16) lista.push(`${String(h).padStart(2, '0')}:30`)
  }
  return lista
})()

function fechaHoraUtc(fecha, hora) {
  return new Date(`${fecha}T${hora}:00-06:00`).toISOString()
}

function fechaHoraLocal(valor) {
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''

  const fechaTexto = fecha.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const horaTexto = fecha.toLocaleTimeString('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${fechaTexto} a las ${horaTexto}`
}

export default function NuevaCita() {
  const location = useLocation()
  const rol = sessionStorage.getItem('rol')
  const esDoctor = rol === 'doctor'
  const asignaDoctor = rol === 'secretaria' || rol === 'admin'

  const [nombrePaciente, setNombrePaciente] = useState(
    location.state?.nombre_paciente ?? ''
  )
  const [correoPaciente, setCorreoPaciente] = useState(
    location.state?.correo_paciente ?? ''
  )
  const [urgencia, setUrgencia] = useState(
    location.state?.urgencia ?? 'normal'
  )
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [especialidadId, setEspecialidadId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [codigo, setCodigo] = useState('')

  const [especialidades, setEspecialidades] = useState([])
  const [doctores, setDoctores] = useState([])
  const [cargandoDoctores, setCargandoDoctores] = useState(false)

  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!asignaDoctor) return

    listarEspecialidades().then(({ status, data }) => {
      if (status === 200) {
        setEspecialidades(
          (data?.especialidades ?? []).filter((e) => e.activo !== false)
        )
      }
    })
  }, [asignaDoctor])

  useEffect(() => {
    if (!asignaDoctor) return

    if (!especialidadId || !fecha || !hora) {
      setDoctores([])
      setDoctorId('')
      setCargandoDoctores(false)
      return
    }

    let activo = true
    setCargandoDoctores(true)

    doctoresDisponibles({
      especialidad_id: Number(especialidadId),
      fecha_hora: fechaHoraUtc(fecha, hora),
    }).then(({ status, data }) => {
      if (!activo) return

      if (status === 200) {
        setDoctores(data?.doctores ?? [])
      } else {
        setDoctores([])
        setError(data?.error ?? 'Error del servidor')
      }

      setDoctorId('')
      setCargandoDoctores(false)
    })

    return () => {
      activo = false
    }
  }, [asignaDoctor, especialidadId, fecha, hora, urgencia])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')

    if (esDoctor) {
      const limpio = codigo.replace(/\s/g, '')

      if (!/^\d{6}$/.test(limpio)) {
        setError('El código debe tener 6 dígitos')
        return
      }
    }

    if (
      correoPaciente &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correoPaciente)
    ) {
      setError('El correo no es válido')
      return
    }

    if (asignaDoctor && !doctorId) {
      setError(
        doctores.length > 0
          ? 'Selecciona un doctor'
          : 'No hay doctores libres en ese horario'
      )
      return
    }

    setEnviando(true)

    try {
      const payload = {
        nombre_paciente: nombrePaciente,
        urgencia,
        fecha_hora: fechaHoraUtc(fecha, hora),
      }

      if (correoPaciente) {
        payload.correo_paciente = correoPaciente
      }

      if (esDoctor) {
        payload.codigo_totp = codigo.replace(/\s/g, '')
      } else {
        payload.especialidad_id = Number(especialidadId)
        payload.doctor_id =
          doctorId === 'cualquiera' ? 'cualquiera' : Number(doctorId)
      }

      const { status, data } = await crearCita(payload)

      if (status === 200) {
        const estado =
          data?.estado ?? data?.estado_cita ?? data?.estatus ?? 'asignada'
        const textoEstado =
          estado === 'pendiente_aprobacion'
            ? 'Pendiente de aprobación del doctor'
            : 'Confirmada'

        setExito(
          `Cita agendada el ${fechaHoraLocal(payload.fecha_hora)}. Estado: ${textoEstado}`
        )
        setCorreoPaciente('')
        return
      }

      if (status === 403) {
        setError(
          'Cuenta bloqueada temporalmente. Intenta en 15 minutos o contacta a un administrador.'
        )
        return
      }

      setError(data?.error ?? 'Error del servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Nueva cita</h1>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="nombre_paciente">Nombre del paciente</label>
          <input
            id="nombre_paciente"
            type="text"
            value={nombrePaciente}
            onChange={(e) => setNombrePaciente(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="correo_paciente">Correo del paciente</label>
          <input
            id="correo_paciente"
            type="email"
            value={correoPaciente}
            onChange={(e) =>
              setCorreoPaciente(e.target.value.replace(/\s/g, '').toLowerCase())
            }
          />
          <p className="subtitulo">
            Se usa para enviarle la confirmación y el recordatorio. Puede dejarse
            vacío.
          </p>
        </div>

        <div className="campo">
          <label htmlFor="urgencia">Urgencia</label>
          <select
            id="urgencia"
            value={urgencia}
            onChange={(e) => setUrgencia(e.target.value)}
          >
            <option value="alta">alta</option>
            <option value="normal">normal</option>
            <option value="baja">baja</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="hora">Hora</label>
          <select
            id="hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          >
            <option value="">Selecciona una hora</option>
            {HORAS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {esDoctor && (
          <p className="subtitulo">
            La cita se agenda en tu agenda y tu especialidad.
          </p>
        )}

        {asignaDoctor && (
          <div className="campo">
            <label htmlFor="especialidad">Especialidad</label>
            <select
              id="especialidad"
              value={especialidadId}
              onChange={(e) => setEspecialidadId(e.target.value)}
              required
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {asignaDoctor && especialidadId && fecha && hora && (
          <div className="campo">
            <label htmlFor="doctor">Doctor</label>

            {cargandoDoctores ? (
              <p className="subtitulo">Consultando doctores disponibles...</p>
            ) : doctores.length === 0 ? (
              <p className="error">No hay doctores libres en ese horario</p>
            ) : (
              <select
                id="doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="">Selecciona un doctor</option>
                {urgencia !== 'alta' && (
                  <option value="cualquiera">Cualquiera disponible</option>
                )}
                {doctores.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.correo} - {doc.especialidad}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {esDoctor && (
          <div className="campo">
            <label htmlFor="codigo">Código de autenticación</label>
            <input
              id="codigo"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {exito && <p className="exito">{exito}</p>}

        <button className="boton-primario" type="submit" disabled={enviando}>
          {enviando ? 'Agendando...' : 'Agendar cita'}
        </button>
      </form>
    </div>
  )
}
