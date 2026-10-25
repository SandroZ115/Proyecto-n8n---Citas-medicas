import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminUsuarios, desbloquearUsuario } from '../services/api'
import { cerrarSesionVencida } from '../services/sesion'
import TablaResponsiva from '../components/TablaResponsiva'

export default function Usuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [mostrarBaja, setMostrarBaja] = useState(false)
  const [filtroRol, setFiltroRol] = useState('todos')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    setCargando(true)
    setErrorCarga('')

    const { status, data } = await adminUsuarios({ accion: 'listar' })

    if (status === 200) {
      setUsuarios(data?.usuarios ?? [])
    } else if (status === 401) {
      cerrarSesionVencida(navigate)
      return
    } else if (status === 403) {
      navigate('/dashboard')
      return
    } else {
      setErrorCarga(data?.error ?? 'Error del servidor')
    }

    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  async function ejecutar(payload) {
    setMensaje('')
    setError('')
    setEnviando(true)

    try {
      const { status, data } = await adminUsuarios(payload)

      if (status === 200) {
        setMensaje(data?.mensaje ?? 'Operación realizada')
      } else if (status === 401) {
        cerrarSesionVencida(navigate)
        return
      } else if (status === 403) {
        navigate('/dashboard')
        return
      } else if (status === 404 || status === 409) {
        setError(data?.error ?? 'Error del servidor')
      } else {
        setError(data?.error ?? 'Error del servidor')
      }

      await cargar()
    } finally {
      setEnviando(false)
    }
  }

  async function desbloquear(correo) {
    setMensaje('')
    setError('')
    setEnviando(true)

    try {
      const { status, data } = await desbloquearUsuario(correo)

      if (status === 200) {
        setMensaje(data?.mensaje ?? 'Usuario desbloqueado')
      } else if (status === 401) {
        cerrarSesionVencida(navigate)
        return
      } else if (status === 403) {
        navigate('/dashboard')
        return
      } else {
        setError(data?.error ?? 'Error del servidor')
      }

      await cargar()
    } finally {
      setEnviando(false)
    }
  }

  function darDeBaja(usuario) {
    if (
      !window.confirm(
        `¿Dar de baja a ${usuario.correo}? Perderá el acceso de inmediato.`
      )
    ) {
      return
    }
    ejecutar({ accion: 'baja', usuario_id: usuario.id })
  }

  function reactivar(usuario) {
    ejecutar({ accion: 'reactivar', usuario_id: usuario.id })
  }

  const visibles = usuarios.filter((u) => {
    if (!mostrarBaja && !u.activo) return false
    if (filtroRol !== 'todos' && u.rol !== filtroRol) return false
    return true
  })

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Usuarios</h1>

      <div className="filtros">
        <label className="filtro-check">
          <input
            type="checkbox"
            checked={mostrarBaja}
            onChange={(e) => setMostrarBaja(e.target.checked)}
          />
          Mostrar dados de baja
        </label>

        <select
          className="filtro-select"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          <option value="doctor">Doctor</option>
          <option value="secretaria">Secretaria</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {cargando && <p className="subtitulo">Cargando usuarios...</p>}

      {errorCarga && <p className="error">{errorCarga}</p>}

      {!cargando && !errorCarga && visibles.length === 0 && (
        <p className="subtitulo">No hay usuarios que mostrar</p>
      )}

      {!cargando && visibles.length > 0 && (
        <TablaResponsiva className="tabla-responsiva--apilada">
          <table className="tabla">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Rol</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Bloqueado</th>
                <th>Citas abiertas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((u) => (
                <tr key={u.id}>
                  <td data-label="Correo">{u.correo}</td>
                  <td data-label="Rol">{u.rol}</td>
                  <td data-label="Especialidad">
                    {u.rol === 'doctor' ? (u.especialidad ?? '') : ''}
                  </td>
                  <td data-label="Estado">{u.activo ? 'Activo' : 'Dado de baja'}</td>
                  <td data-label="Bloqueado">{u.bloqueado ? 'Sí' : 'No'}</td>
                  <td data-label="Citas abiertas">
                    {u.rol === 'doctor' ? (u.citas_abiertas ?? 0) : ''}
                  </td>
                  <td data-label="Acciones" data-acciones>
                    {u.activo ? (
                      <button
                        className="boton-secundario"
                        onClick={() => darDeBaja(u)}
                        disabled={enviando}
                      >
                        Dar de baja
                      </button>
                    ) : (
                      <button
                        className="boton-secundario"
                        onClick={() => reactivar(u)}
                        disabled={enviando}
                      >
                        Reactivar
                      </button>
                    )}
                    {u.bloqueado && (
                      <button
                        className="boton-secundario"
                        onClick={() => desbloquear(u.correo)}
                        disabled={enviando}
                      >
                        Desbloquear
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaResponsiva>
      )}

      {mensaje && <p className="exito">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
