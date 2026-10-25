import { useEffect, useState } from 'react'
import { listarEspecialidades, adminEspecialidades } from '../services/api'
import TablaResponsiva from '../components/TablaResponsiva'

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const [editando, setEditando] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    setCargando(true)
    setErrorCarga('')

    const { status, data } = await listarEspecialidades()

    if (status === 200) {
      setEspecialidades(data?.especialidades ?? [])
    } else {
      setErrorCarga(data?.error ?? 'Error del servidor')
    }

    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  async function ejecutar(payload, desactivar = false) {
    setMensaje('')
    setError('')
    setEnviando(true)

    try {
      const { status, data } = await adminEspecialidades(payload)

      if (status === 200) {
        setMensaje(data?.mensaje ?? 'Operación realizada')
      } else if (status === 409 && desactivar) {
        setError(
          'No se puede: tiene doctores asignados o el nombre está repetido'
        )
      } else {
        setError(data?.error ?? 'Error del servidor')
      }

      await cargar()
    } finally {
      setEnviando(false)
    }
  }

  async function handleCrear(e) {
    e.preventDefault()
    await ejecutar({ accion: 'crear', nombre, descripcion })
    setNombre('')
    setDescripcion('')
  }

  function abrirEdicion(esp) {
    setEditando(esp)
    setEditNombre(esp.nombre ?? '')
    setEditDescripcion(esp.descripcion ?? '')
    setMensaje('')
    setError('')
  }

  async function handleEditar(e) {
    e.preventDefault()
    await ejecutar({
      accion: 'editar',
      id: editando.id,
      nombre: editNombre,
      descripcion: editDescripcion,
    })
    setEditando(null)
  }

  function alternarEstado(esp) {
    const activo = !esp.activo
    return ejecutar({ accion: 'estado', id: esp.id, activo }, !activo)
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Especialidades</h1>

      {cargando && <p className="subtitulo">Cargando especialidades...</p>}

      {errorCarga && <p className="error">{errorCarga}</p>}

      {!cargando && !errorCarga && especialidades.length === 0 && (
        <p className="subtitulo">No hay especialidades registradas</p>
      )}

      {!cargando && especialidades.length > 0 && (
        <TablaResponsiva className="tabla-responsiva--apilada">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.map((esp) => (
                <tr key={esp.id}>
                  <td data-label="Nombre">{esp.nombre}</td>
                  <td data-label="Descripción">{esp.descripcion}</td>
                  <td data-label="Estado">{esp.activo ? 'Activa' : 'Inactiva'}</td>
                  <td data-label="Acciones" data-acciones>
                    <button
                      className="boton-secundario"
                      onClick={() => abrirEdicion(esp)}
                      disabled={enviando}
                    >
                      Editar
                    </button>
                    <button
                      className="boton-secundario"
                      onClick={() => alternarEstado(esp)}
                      disabled={enviando}
                    >
                      {esp.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaResponsiva>
      )}

      {mensaje && <p className="exito">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {editando ? (
        <div className="recuadro">
          <h2 className="subtitulo">Editar especialidad</h2>
          <form onSubmit={handleEditar}>
            <div className="campo">
              <label htmlFor="edit-nombre">Nombre</label>
              <input
                id="edit-nombre"
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="edit-descripcion">Descripción</label>
              <input
                id="edit-descripcion"
                type="text"
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
              />
            </div>

            <button
              className="boton-primario"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              className="boton-secundario boton-bloque"
              type="button"
              onClick={() => setEditando(null)}
              disabled={enviando}
            >
              Cancelar
            </button>
          </form>
        </div>
      ) : (
        <div className="recuadro">
          <h2 className="subtitulo">Nueva especialidad</h2>
          <form onSubmit={handleCrear}>
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Descripción</label>
              <input
                id="descripcion"
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <button
              className="boton-primario"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Creando...' : 'Crear especialidad'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
