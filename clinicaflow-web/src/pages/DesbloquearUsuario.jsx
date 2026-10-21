import { useState } from 'react'
import { desbloquearUsuario } from '../services/api'

export default function DesbloquearUsuario() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setEnviando(true)

    try {
      const { status, data } = await desbloquearUsuario(correo)

      if (status === 200) {
        setExito(data?.mensaje ?? 'Usuario desbloqueado')
        return
      }

      setError(data?.error ?? 'Error del servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-ancha">
      <h1 className="titulo">Desbloquear usuario</h1>
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

        {error && <p className="error">{error}</p>}
        {exito && <p className="exito">{exito}</p>}

        <button className="boton-primario" type="submit" disabled={enviando}>
          {enviando ? 'Desbloqueando...' : 'Desbloquear usuario'}
        </button>
      </form>
    </div>
  )
}
