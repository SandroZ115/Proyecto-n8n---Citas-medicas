import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarPendientes, aprobarCita } from '../services/api'
import { cerrarSesionVencida } from '../services/sesion'

function fechaLegible(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return String(valor)
  return fecha.toLocaleString('es-ES')
}

export default function AprobarCita() {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [seleccionada, setSeleccionada] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true

    listarPendientes().then(({ status, data }) => {
      if (!activo) return

      if (status === 401) {
        cerrarSesionVencida(navigate)
        return
      }

      if (status === 200) {
        setCitas(data?.citas ?? [])
      } else {
        setErrorCarga(data?.error ?? 'Error del servidor')
      }

      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [navigate])

  function revisar(cita) {
    setSeleccionada(cita)
    setCodigo('')
    setError('')
    setExito('')
  }

  function cancelar() {
    setSeleccionada(null)
    setCodigo('')
    setError('')
  }

  async function confirmar() {
    const limpio = codigo.replace(/\s/g, '')

    if (!/^\d{6}$/.test(limpio)) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setError('')
    setEnviando(true)

    try {
      const { status, data } = await aprobarCita(seleccionada.id, limpio)

      if (status === 200) {
        setExito(data?.mensaje ?? 'Cita aprobada')
        setCitas((prev) => prev.filter((c) => c.id !== seleccionada.id))
        setSeleccionada(null)
        setCodigo('')
        return
      }

      if (status === 401) {
        setError('Código incorrecto')
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
      <h1 className="titulo">Aprobar cita</h1>

      {cargando && <p className="subtitulo">Cargando citas pendientes...</p>}

      {errorCarga && <p className="error">{errorCarga}</p>}

      {!cargando && !errorCarga && citas.length === 0 && (
        <p className="subtitulo">No hay citas pendientes de aprobación</p>
      )}

      {!cargando && citas.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Especialidad</th>
              <th>Urgencia</th>
              <th>Horario asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.nombre_paciente}</td>
                <td>{cita.especialidad}</td>
                <td className={cita.urgencia === 'alta' ? 'urgencia-alta' : ''}>
                  {cita.urgencia}
                </td>
                <td>{fechaLegible(cita.horario_asignado)}</td>
                <td>
                  <button
                    className="boton-secundario"
                    onClick={() => revisar(cita)}
                  >
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {exito && <p className="exito">{exito}</p>}

      {seleccionada && (
        <div className="recuadro">
          <h2 className="subtitulo">Resumen de la cita</h2>
          <p className="recuadro-linea">
            Paciente: {seleccionada.nombre_paciente}
          </p>
          <p className="recuadro-linea">
            Especialidad: {seleccionada.especialidad}
          </p>
          <p className="recuadro-linea">
            Urgencia: {seleccionada.urgencia}
          </p>
          <p className="recuadro-linea">
            Horario asignado: {fechaLegible(seleccionada.horario_asignado)}
          </p>

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

          {error && <p className="error">{error}</p>}

          <button
            className="boton-primario"
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? 'Aprobando...' : 'Confirmar aprobación'}
          </button>
          <button
            className="boton-secundario boton-bloque"
            onClick={cancelar}
            disabled={enviando}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
