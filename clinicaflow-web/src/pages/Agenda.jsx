import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agenda, listarEspecialidades } from '../services/api'
import { cerrarSesionVencida } from '../services/sesion'
import TablaResponsiva from '../components/TablaResponsiva'

function fechaISO(d) {
  const anio = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function desdeUtc(valor) {
  return new Date(`${valor}T00:00:00-06:00`).toISOString()
}

function hastaUtc(valor) {
  return new Date(`${valor}T23:59:59-06:00`).toISOString()
}

function fechaLocal(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return String(valor)

  return `${fecha.toLocaleDateString('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} ${fecha.toLocaleTimeString('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}

function etiquetaEstado(estado) {
  switch (estado) {
    case 'pendiente_aprobacion':
      return 'Pendiente de aprobación'
    case 'asignada':
    case 'notificada':
    case 'recordada':
      return 'Confirmada'
    case 'completada':
      return 'Completada'
    case 'cancelada':
      return 'Cancelada'
    default:
      return estado ?? ''
  }
}

function doctorDe(cita) {
  return cita.doctor ?? cita.doctor_correo ?? cita.doctor_email ?? ''
}

export default function Agenda() {
  const navigate = useNavigate()
  const rol = sessionStorage.getItem('rol')
  const veAsignacion = rol === 'secretaria' || rol === 'admin'
  const veCompletar = rol === 'doctor' || rol === 'admin'

  const [desde, setDesde] = useState(() => fechaISO(new Date()))
  const [hasta, setHasta] = useState(() =>
    fechaISO(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  )
  const [especialidadId, setEspecialidadId] = useState('')
  const [doctorId, setDoctorId] = useState('')

  const [especialidades, setEspecialidades] = useState([])
  const [citas, setCitas] = useState([])
  const [sinAsignar, setSinAsignar] = useState([])

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorSinAsignar, setErrorSinAsignar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  function sesionExpirada() {
    cerrarSesionVencida(navigate)
  }

  async function cargarListado() {
    setCargando(true)
    setErrorCarga('')

    const payload = {
      accion: 'listar',
      desde: desdeUtc(desde),
      hasta: hastaUtc(hasta),
    }

    if (especialidadId) {
      payload.especialidad_id = Number(especialidadId)
    }

    const { status, data } = await agenda(payload)

    if (status === 401) {
      sesionExpirada()
      return
    }

    if (status === 200) {
      setCitas(data?.citas ?? [])
    } else {
      setCitas([])
      setErrorCarga(data?.error ?? 'Error del servidor')
    }

    setCargando(false)
  }

  async function cargarSinAsignar() {
    if (!veAsignacion) return

    setErrorSinAsignar('')

    const { status, data } = await agenda({ accion: 'sin_asignar' })

    if (status === 401) {
      sesionExpirada()
      return
    }

    if (status === 200) {
      setSinAsignar(
        data?.sin_asignar ?? data?.solicitudes ?? data?.citas ?? []
      )
    } else {
      setSinAsignar([])
      setErrorSinAsignar(data?.error ?? 'Error del servidor')
    }
  }

  useEffect(() => {
    cargarSinAsignar()

    if (veAsignacion) {
      listarEspecialidades().then(({ status, data }) => {
        if (status === 200) {
          setEspecialidades(
            (data?.especialidades ?? []).filter((e) => e.activo !== false)
          )
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    cargarListado()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, especialidadId])

  const doctores = useMemo(() => {
    const vistos = new Set()
    const lista = []
    for (const cita of citas) {
      const nombre = doctorDe(cita)
      if (!nombre || vistos.has(nombre)) continue
      vistos.add(nombre)
      lista.push(nombre)
    }
    return lista
  }, [citas])

  const doctorFiltrado = doctores.includes(doctorId) ? doctorId : ''

  const citasFiltradas = useMemo(() => {
    if (!doctorFiltrado) return citas
    return citas.filter((cita) => doctorDe(cita) === doctorFiltrado)
  }, [citas, doctorFiltrado])

  async function ejecutarAccion(accion, cita) {
    const texto =
      accion === 'cancelar'
        ? `¿Seguro que quieres cancelar la cita de ${cita.nombre_paciente}?`
        : `¿Marcar como completada la cita de ${cita.nombre_paciente}?`

    if (!window.confirm(texto)) return

    setError('')
    setMensaje('')
    setEnviando(true)

    try {
      const { status, data } = await agenda({ accion, cita_id: cita.id })

      if (status === 401) {
        sesionExpirada()
        return
      }

      if (status === 200) {
        setMensaje(data?.mensaje ?? 'Operación realizada')
        await Promise.all([cargarListado(), cargarSinAsignar()])
        return
      }

      setError(data?.error ?? 'Error del servidor')
    } finally {
      setEnviando(false)
    }
  }

  async function cancelarSinAsignar(solicitud) {
    if (!window.confirm(`¿Cancelar la solicitud de ${solicitud.nombre_paciente}?`))
      return

    setError('')
    setMensaje('')
    setEnviando(true)

    try {
      const { status, data } = await agenda({
        accion: 'cancelar',
        cita_id: solicitud.id,
      })

      if (status === 401) {
        sesionExpirada()
        return
      }

      if (status === 200) {
        setMensaje(data?.mensaje ?? 'Operación realizada')
        await Promise.all([cargarListado(), cargarSinAsignar()])
        return
      }

      setError(data?.error ?? 'Error del servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Agenda</h1>

      <div className="campo">
        <label htmlFor="desde">Desde</label>
        <input
          id="desde"
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="hasta">Hasta</label>
        <input
          id="hasta"
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>

      {veAsignacion && (
        <div className="campo">
          <label htmlFor="especialidad">Especialidad</label>
          <select
            id="especialidad"
            value={especialidadId}
            onChange={(e) => {
              setEspecialidadId(e.target.value)
              setDoctorId('')
            }}
          >
            <option value="">Todas</option>
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {veAsignacion && doctores.length > 0 && (
        <div className="campo">
          <label htmlFor="doctor">Doctor</label>
          <select
            id="doctor"
            value={doctorFiltrado}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Todos</option>
            {doctores.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {mensaje && <p className="exito">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {cargando && <p className="subtitulo">Cargando agenda...</p>}

      {!cargando && errorCarga && <p className="error">{errorCarga}</p>}

      {!cargando && !errorCarga && citasFiltradas.length === 0 && (
        <p className="subtitulo">No hay citas en el rango seleccionado</p>
      )}

      {!cargando && !errorCarga && citasFiltradas.length > 0 && (
        <TablaResponsiva className="tabla-responsiva--apilada">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Doctor</th>
                <th>Urgencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => {
                const estado = etiquetaEstado(cita.estado)
                const puedeCancelar =
                  cita.estado !== 'completada' && cita.estado !== 'cancelada'
                const puedeCompletar = veCompletar && estado === 'Confirmada'

                return (
                  <tr key={cita.id}>
                    <td data-label="Fecha y hora">
                      {fechaLocal(cita.fecha_hora ?? cita.horario_asignado)}
                    </td>
                    <td data-label="Paciente">{cita.nombre_paciente}</td>
                    <td data-label="Especialidad">{cita.especialidad}</td>
                    <td data-label="Doctor">{doctorDe(cita)}</td>
                    <td
                      data-label="Urgencia"
                      className={cita.urgencia === 'alta' ? 'urgencia-alta' : ''}
                    >
                      {cita.urgencia}
                    </td>
                    <td data-label="Estado">{estado}</td>
                    <td data-label="Acciones" data-acciones>
                      {puedeCancelar && (
                        <button
                          className="boton-secundario"
                          onClick={() => ejecutarAccion('cancelar', cita)}
                          disabled={enviando}
                        >
                          Cancelar
                        </button>
                      )}
                      {puedeCompletar && (
                        <button
                          className="boton-secundario"
                          onClick={() => ejecutarAccion('completar', cita)}
                          disabled={enviando}
                        >
                          Completar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TablaResponsiva>
      )}

      {veAsignacion && (
        <div className="recuadro">
          <h2 className="subtitulo">Sin asignar</h2>
          <p className="recuadro-linea">
            Solicitudes del formulario público cuya especialidad no se pudo
            asignar.
          </p>

          {errorSinAsignar && <p className="error">{errorSinAsignar}</p>}

          {!errorSinAsignar && sinAsignar.length === 0 && (
            <p className="subtitulo">No hay solicitudes sin asignar</p>
          )}

          {sinAsignar.length > 0 && (
            <TablaResponsiva className="tabla-responsiva--apilada">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Especialidad</th>
                    <th>Urgencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sinAsignar.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td data-label="Paciente">{solicitud.nombre_paciente}</td>
                      <td data-label="Especialidad">{solicitud.especialidad}</td>
                      <td
                        data-label="Urgencia"
                        className={
                          solicitud.urgencia === 'alta' ? 'urgencia-alta' : ''
                        }
                      >
                        {solicitud.urgencia}
                      </td>
                      <td data-label="Acciones" data-acciones>
                        <button
                          className="boton-secundario"
                          onClick={() =>
                            navigate('/dashboard/nueva', {
                              state: {
                                nombre_paciente: solicitud.nombre_paciente,
                                urgencia: solicitud.urgencia,
                              },
                            })
                          }
                          disabled={enviando}
                        >
                          Agendar
                        </button>
                        <button
                          className="boton-secundario"
                          onClick={() => cancelarSinAsignar(solicitud)}
                          disabled={enviando}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaResponsiva>
          )}
        </div>
      )}
    </div>
  )
}
