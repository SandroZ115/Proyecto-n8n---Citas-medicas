import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { APP_NAME } from '../config'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import { useToast } from '../components/ui/Toast'

function IconoEscudo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.4-2.9 8.3-7 9.5C7.9 19.3 5 15.4 5 11V6l7-3z" />
      <path d="M9.2 12.2l2 2 3.6-4" />
    </svg>
  )
}

function IconoCalendario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8.5 14h7" />
    </svg>
  )
}

function IconoBitacora() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 4h6v3H9z" />
      <path d="M15 5h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

function IconoAlerta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function IconoOjo({ tapado }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
      {tapado && <path d="M4 4l16 16" />}
    </svg>
  )
}

const DATOS_PANEL = [
  { texto: 'Verificación en dos pasos', Icono: IconoEscudo },
  { texto: 'Citas sin solapes', Icono: IconoCalendario },
  { texto: 'Registro de auditoría', Icono: IconoBitacora },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [codigoApp, setCodigoApp] = useState('')
  const [codigoRespaldo, setCodigoRespaldo] = useState('')
  const [usarRespaldo, setUsarRespaldo] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const inputRespaldoRef = useRef(null)
  const inputAppRef = useRef(null)

  const vencida = Boolean(location.state?.vencida)

  function limpiarError(campo) {
    setErrores((prev) => {
      if (!prev[campo]) return prev
      const siguiente = { ...prev }
      delete siguiente[campo]
      return siguiente
    })
  }

  function formatearCodigoApp(valor) {
    return valor.replace(/\D/g, '').slice(0, 6)
  }

  function formatearCodigoRespaldo(valor) {
    const limpio = valor
      .toUpperCase()
      .replace(/[^A-F0-9]/g, '')
      .slice(0, 8)
    if (limpio.length <= 4) return limpio
    return `${limpio.slice(0, 4)}-${limpio.slice(4)}`
  }

  function cambiarModo() {
    if (usarRespaldo) {
      setUsarRespaldo(false)
      setCodigoRespaldo('')
      limpiarError('codigo_respaldo')
      setTimeout(() => {
        inputAppRef.current?.focus()
      }, 50)
    } else {
      setUsarRespaldo(true)
      limpiarError('codigo_app')
      setTimeout(() => {
        inputRespaldoRef.current?.focus()
      }, 50)
    }
  }

  function validar() {
    const nuevos = {}

    if (!correo.trim()) {
      nuevos.correo = 'Escribe tu correo'
    }

    if (!password) {
      nuevos.password = 'Escribe tu contraseña'
    }

    if (usarRespaldo) {
      if (!/^[0-9A-F]{4}-[0-9A-F]{4}$/.test(codigoRespaldo)) {
        nuevos.codigo_respaldo = 'El código de respaldo tiene el formato XXXX-XXXX'
      }
    } else {
      if (!/^\d{6}$/.test(codigoApp)) {
        nuevos.codigo_app = 'El código debe tener 6 dígitos'
      }
    }

    return nuevos
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setAviso(null)

    const nuevos = validar()
    setErrores(nuevos)

    if (Object.keys(nuevos).length > 0) {
      return
    }

    setEnviando(true)

    try {
      const codigoEnviar = usarRespaldo
        ? codigoRespaldo.replace('-', '')
        : codigoApp
      const { status, data } = await login(correo, password, codigoEnviar)

      if (status === 200) {
        sessionStorage.setItem('token', data?.token ?? '')
        sessionStorage.setItem('rol', data?.rol ?? '')
        sessionStorage.setItem('expira_en', data?.expira_en ?? '')
        sessionStorage.setItem('correo', data?.correo ?? '')
        if (usarRespaldo) {
          toast.success('Iniciaste con un código de respaldo. Cada código sirve una sola vez.')
        }
        navigate('/dashboard')
        return
      }

      if (status === 401) {
        setAviso({
          tipo: 'error',
          texto:
            'Credenciales inválidas. Revisa tu correo, contraseña y código.',
        })
        if (usarRespaldo) {
          setCodigoRespaldo('')
          limpiarError('codigo_respaldo')
        } else {
          setCodigoApp('')
          limpiarError('codigo_app')
        }
        return
      }

      if (status === 403) {
        setAviso({
          tipo: 'alerta',
          texto:
            'Cuenta bloqueada temporalmente. Intenta en 15 minutos o pide a un administrador que la desbloquee.',
        })
        return
      }

      setAviso({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <aside className="login-panel">
        <h1 className="login-panel__nombre">{APP_NAME}</h1>
        <p className="login-panel__frase">
          Citas médicas con acceso seguro y verificación en dos pasos
        </p>

        <ul className="login-panel__lista">
          {DATOS_PANEL.map(({ texto, Icono }) => (
            <li key={texto} className="login-dato">
              <Icono />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="login-columna">
        <Card className="login-card">
          {vencida && (
            <p className="login-aviso login-aviso--info">
              Tu sesión venció. Inicia sesión de nuevo.
            </p>
          )}

          <h2 className="titulo">Iniciar sesión</h2>

          {aviso && (
            <div
              className={`login-aviso login-aviso--${aviso.tipo}`}
              role={aviso.tipo === 'error' ? 'alert' : 'status'}
            >
              {aviso.tipo === 'alerta' && <IconoAlerta />}
              <span>{aviso.texto}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field
              label="Correo"
              id="correo"
              error={errores.correo}
              className="login-campo"
            >
              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value)
                  limpiarError('correo')
                }}
                autoComplete="username"
                autoFocus
              />
            </Field>

            <div className="ui-field login-campo">
              <label className="ui-field__label" htmlFor="password">
                Contraseña
              </label>
              <div className="login-clave-caja">
                <input
                  id="password"
                  className="ui-field__control"
                  type={verClave ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    limpiarError('password')
                  }}
                  autoComplete="current-password"
                  aria-invalid={errores.password ? true : undefined}
                  aria-describedby={errores.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="login-ver-clave"
                  onClick={() => setVerClave((prev) => !prev)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={verClave}
                >
                  <IconoOjo tapado={verClave} />
                </button>
              </div>
              {errores.password && (
                <p className="ui-field__error" id="password-error">
                  {errores.password}
                </p>
              )}
            </div>

            <Field
              label="Código de autenticación"
              id="codigo_app"
              error={errores.codigo_app}
              className="login-campo login-campo-codigo"
            >
              <input
                ref={inputAppRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                  value={codigoApp}
                onChange={(e) => {
                  if (usarRespaldo) {
                    return
                  }
                  setCodigoApp(formatearCodigoApp(e.target.value))
                  limpiarError('codigo_app')
                }}
                autoComplete="one-time-code"
                className="login-codigo"
                disabled={usarRespaldo}
                aria-disabled={usarRespaldo}
              />
            </Field>

            {usarRespaldo && (
              <p className="login-respaldo-nota">Estás usando un código de respaldo</p>
            )}

            <div className="login-codigo-enlace">
              <button
                type="button"
                className="login-enlace"
                onClick={cambiarModo}
                aria-expanded={usarRespaldo}
                aria-controls="codigo-respaldo-contenedor"
              >
                {usarRespaldo
                  ? 'Volver al código de la aplicación'
                  : 'Usar un código de respaldo'}
              </button>
            </div>

            <div
              id="codigo-respaldo-contenedor"
              className={`login-respaldo-contenedor${usarRespaldo ? ' login-respaldo-contenedor--abierto' : ''}`}
              aria-hidden={!usarRespaldo}
            >
              <div className="login-respaldo-contenedor__interior">
                <Field
                  label="Código de respaldo"
                  id="codigo_respaldo"
                  error={errores.codigo_respaldo}
                  className="login-campo login-campo-codigo login-campo-codigo-respaldo"
                  help="Es uno de los 8 códigos que recibiste al crear tu cuenta. Cada uno sirve una sola vez."
                >
                <input
                  ref={inputRespaldoRef}
                  type="text"
                  inputMode="text"
                  maxLength={9}
                  value={codigoRespaldo}
                  onChange={(e) => {
                    setCodigoRespaldo(formatearCodigoRespaldo(e.target.value))
                    limpiarError('codigo_respaldo')
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="characters"
                  className="login-codigo"
                  tabIndex={usarRespaldo ? 0 : -1}
                  placeholder="XXXX-XXXX"
                />
                </Field>
              </div>
            </div>

            <Button type="submit" loading={enviando} className="login-boton">
              Ingresar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
