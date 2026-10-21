import { useEffect, useState } from 'react'
import { registrarUsuario, listarEspecialidades } from '../services/api'

export default function CrearUsuario() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('doctor')
  const [especialidadId, setEspecialidadId] = useState('')
  const [especialidades, setEspecialidades] = useState([])
  const [error, setError] = useState('')
  const [credenciales, setCredenciales] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true

    listarEspecialidades().then(({ status, data }) => {
      if (!activo || status !== 200) return
      const activas = (data?.especialidades ?? []).filter((esp) => esp.activo)
      setEspecialidades(activas)
    })

    return () => {
      activo = false
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCredenciales(null)

    if (rol === 'doctor' && !especialidadId) {
      setError('Selecciona una especialidad')
      return
    }

    setEnviando(true)

    try {
      const { status, data } = await registrarUsuario({
        correo,
        password,
        rol,
        especialidad_id: especialidadId,
      })

      if (status === 200) {
        setCredenciales({
          totp_secret: data?.totp_secret,
          codigos_respaldo: data?.codigos_respaldo ?? [],
        })
        return
      }

      setError(data?.error ?? 'Error del servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Crear usuario</h1>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="rol">Rol</label>
          <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="doctor">doctor</option>
            <option value="secretaria">secretaria</option>
            <option value="admin">admin</option>
          </select>
        </div>

        {rol === 'doctor' && (
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

        {error && <p className="error">{error}</p>}

        <button className="boton-primario" type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>

      {credenciales && (
        <div className="recuadro">
          <p className="aviso">Guárdalos ahora, no se vuelven a mostrar</p>
          <p className="recuadro-linea">
            <strong>Secreto TOTP:</strong> {credenciales.totp_secret}
          </p>
          <p className="recuadro-linea">
            <strong>Códigos de respaldo:</strong>
          </p>
          <ul className="lista-codigos">
            {credenciales.codigos_respaldo.map((codigo) => (
              <li key={codigo}>{codigo}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
