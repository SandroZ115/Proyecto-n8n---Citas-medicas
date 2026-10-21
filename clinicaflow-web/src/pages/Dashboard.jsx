import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { agenda, listarPendientes } from '../services/api'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const ZONA = 'America/Guatemala'
const MAX_FILAS = 5
const ACTUALIZACION_MS = 60000

function fechaISO(d) {
  const anio = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function instanteUtc(fechaIso) {
  return new Date(`${fechaIso}T00:00:00-06:00`).toISOString()
}

function fechaLocal(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return String(valor)

  return `${fecha.toLocaleDateString('es-GT', {
    timeZone: ZONA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} ${fecha.toLocaleTimeString('es-GT', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}

function horaActual() {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA,
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const valor = partes.find((parte) => parte.type === 'hour')?.value ?? '00'
  return Number(valor)
}

function saludo() {
  const hora = horaActual()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function fechaDeHoy() {
  return new Date().toLocaleDateString('es-GT', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function varianteUrgencia(urgencia) {
  const valor = String(urgencia ?? '').toLowerCase()
  if (valor === 'alta') return 'danger'
  if (valor === 'normal') return 'warning'
  return 'neutral'
}

function doctorDe(cita) {
  return cita.doctor ?? cita.doctor_correo ?? cita.doctor_email ?? 'Sin doctor'
}

function IconoVistoBueno() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.6 2.6L16 9.5" />
    </svg>
  )
}

function Esqueleto({ filas = 4 }) {
  return (
    <div className="esqueleto-bloque" aria-hidden="true">
      {Array.from({ length: filas }, (_, indice) => (
        <div className="esqueleto" key={indice} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const rol = sessionStorage.getItem('rol')
  const esDoctor = rol === 'doctor'
  const veAsignacion = rol === 'secretaria' || rol === 'admin'

  const [porAprobar, setPorAprobar] = useState({
    cargando: true,
    error: '',
    citas: [],
  })
  const [sinAsignar, setSinAsignar] = useState({
    cargando: true,
    error: '',
    citas: [],
  })
  const [pendientes, setPendientes] = useState({
    cargando: true,
    error: '',
    citas: [],
  })

  const cargar = useCallback(async () => {
    if (esDoctor) {
      const { status, data } = await listarPendientes()

      if (status === 200) {
        setPorAprobar({ cargando: false, error: '', citas: data?.citas ?? [] })
      } else {
        setPorAprobar({
          cargando: false,
          error: data?.error ?? 'No se pudo cargar',
          citas: [],
        })
      }

      return
    }

    const hoy = new Date()
    const dentroDe30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [resSinAsignar, resPendientes] = await Promise.all([
      agenda({ accion: 'sin_asignar' }),
      agenda({
        accion: 'listar',
        desde: instanteUtc(fechaISO(hoy)),
        hasta: instanteUtc(fechaISO(dentroDe30)),
      }),
    ])

    if (resSinAsignar.status === 200) {
      setSinAsignar({
        cargando: false,
        error: '',
        citas:
          resSinAsignar.data?.sin_asignar ??
          resSinAsignar.data?.solicitudes ??
          resSinAsignar.data?.citas ??
          [],
      })
    } else {
      setSinAsignar({
        cargando: false,
        error: resSinAsignar.data?.error ?? 'No se pudo cargar',
        citas: [],
      })
    }

    if (resPendientes.status === 200) {
      const citas = (resPendientes.data?.citas ?? []).filter(
        (cita) => cita.estado === 'pendiente_aprobacion'
      )

      setPendientes({ cargando: false, error: '', citas })
    } else {
      setPendientes({
        cargando: false,
        error: resPendientes.data?.error ?? 'No se pudo cargar',
        citas: [],
      })
    }
  }, [esDoctor])

  useEffect(() => {
    cargar()

    const temporizador = setInterval(cargar, ACTUALIZACION_MS)
    return () => clearInterval(temporizador)
  }, [cargar])

  return (
    <div className="inicio-pagina">
      <header className="inicio-saludo">
        <h1 className="inicio-saludo__titulo">{saludo()}</h1>
        <p className="inicio-saludo__fecha">{fechaDeHoy()}</p>
      </header>

      <div className="inicio-tarjetas">
        {esDoctor && (
          <Card className="tarjeta-grande">
            <div className="tarjeta-grande__cabecera">
              <h2 className="tarjeta-grande__titulo">Citas por aprobar</h2>
              {!porAprobar.cargando && !porAprobar.error && (
                <span className="tarjeta-grande__numero">
                  {porAprobar.citas.length}
                </span>
              )}
            </div>

            {porAprobar.cargando && <Esqueleto />}

            {!porAprobar.cargando && porAprobar.error && (
              <div className="tarjeta-grande__error">
                <p className="tarjeta-grande__error-texto">No se pudo cargar</p>
                <Button variant="secondary" onClick={cargar}>
                  Reintentar
                </Button>
              </div>
            )}

            {!porAprobar.cargando &&
              !porAprobar.error &&
              porAprobar.citas.length === 0 && (
                <p className="tarjeta-grande__vacio">
                  <IconoVistoBueno />
                  <span>No hay pendientes</span>
                </p>
              )}

            {!porAprobar.cargando && !porAprobar.error && porAprobar.citas.length > 0 && (
              <ul className="tarjeta-grande__lista">
                {porAprobar.citas.slice(0, MAX_FILAS).map((cita) => (
                  <li className="inicio-fila" key={cita.id}>
                    <div className="inicio-fila__principal">
                      <span className="inicio-fila__titulo">
                        {cita.nombre_paciente}
                      </span>
                      <Badge variant={varianteUrgencia(cita.urgencia)}>
                        {cita.urgencia ?? '—'}
                      </Badge>
                    </div>
                    <div className="inicio-fila__detalle">
                      <span>{cita.especialidad}</span>
                      <span>{fechaLocal(cita.horario_asignado)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!porAprobar.cargando && !porAprobar.error && (
              <span className="tarjeta-grande__accion">Revisar</span>
            )}

            {!porAprobar.cargando && !porAprobar.error && (
              <Link
                to="/dashboard/aprobar"
                className="tarjeta-grande__capa"
                aria-label="Revisar citas por aprobar"
              />
            )}
          </Card>
        )}

        {veAsignacion && (
          <Card className="tarjeta-grande">
            <div className="tarjeta-grande__cabecera">
              <h2 className="tarjeta-grande__titulo">Sin asignar</h2>
              {!sinAsignar.cargando && !sinAsignar.error && (
                <span className="tarjeta-grande__numero">
                  {sinAsignar.citas.length}
                </span>
              )}
            </div>

            {sinAsignar.cargando && <Esqueleto />}

            {!sinAsignar.cargando && sinAsignar.error && (
              <div className="tarjeta-grande__error">
                <p className="tarjeta-grande__error-texto">No se pudo cargar</p>
                <Button variant="secondary" onClick={cargar}>
                  Reintentar
                </Button>
              </div>
            )}

            {!sinAsignar.cargando &&
              !sinAsignar.error &&
              sinAsignar.citas.length === 0 && (
                <p className="tarjeta-grande__vacio">
                  <IconoVistoBueno />
                  <span>No hay pendientes</span>
                </p>
              )}

            {!sinAsignar.cargando && !sinAsignar.error && sinAsignar.citas.length > 0 && (
              <ul className="tarjeta-grande__lista">
                {sinAsignar.citas.slice(0, MAX_FILAS).map((solicitud) => (
                  <li className="inicio-fila" key={solicitud.id}>
                    <div className="inicio-fila__principal">
                      <span className="inicio-fila__titulo">
                        {solicitud.nombre_paciente}
                      </span>
                      <Badge variant={varianteUrgencia(solicitud.urgencia)}>
                        {solicitud.urgencia ?? '—'}
                      </Badge>
                    </div>
                    <div className="inicio-fila__detalle">
                      <span>{solicitud.especialidad}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!sinAsignar.cargando && !sinAsignar.error && (
              <span className="tarjeta-grande__accion">Agendar</span>
            )}

            {!sinAsignar.cargando && !sinAsignar.error && (
              <Link
                to="/dashboard/agenda"
                className="tarjeta-grande__capa"
                aria-label="Agendar citas sin asignar"
              />
            )}
          </Card>
        )}

        {veAsignacion && (
          <Card className="tarjeta-grande">
            <div className="tarjeta-grande__cabecera">
              <h2 className="tarjeta-grande__titulo">
                Pendientes de aprobación
              </h2>
              {!pendientes.cargando && !pendientes.error && (
                <span className="tarjeta-grande__numero">
                  {pendientes.citas.length}
                </span>
              )}
            </div>

            {pendientes.cargando && <Esqueleto />}

            {!pendientes.cargando && pendientes.error && (
              <div className="tarjeta-grande__error">
                <p className="tarjeta-grande__error-texto">No se pudo cargar</p>
                <Button variant="secondary" onClick={cargar}>
                  Reintentar
                </Button>
              </div>
            )}

            {!pendientes.cargando &&
              !pendientes.error &&
              pendientes.citas.length === 0 && (
                <p className="tarjeta-grande__vacio">
                  <IconoVistoBueno />
                  <span>No hay pendientes</span>
                </p>
              )}

            {!pendientes.cargando && !pendientes.error && pendientes.citas.length > 0 && (
              <ul className="tarjeta-grande__lista">
                {pendientes.citas.slice(0, MAX_FILAS).map((cita) => (
                  <li className="inicio-fila" key={cita.id}>
                    <div className="inicio-fila__principal">
                      <span className="inicio-fila__titulo">
                        {cita.nombre_paciente}
                      </span>
                      <span className="inicio-fila__doctor">
                        {doctorDe(cita)}
                      </span>
                    </div>
                    <div className="inicio-fila__detalle">
                      <span>
                        {fechaLocal(cita.fecha_hora ?? cita.horario_asignado)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!pendientes.cargando && !pendientes.error && (
              <span className="tarjeta-grande__accion">Ver en la agenda</span>
            )}

            {!pendientes.cargando && !pendientes.error && (
              <Link
                to="/dashboard/agenda"
                className="tarjeta-grande__capa"
                aria-label="Ver las citas pendientes de aprobación en la agenda"
              />
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
