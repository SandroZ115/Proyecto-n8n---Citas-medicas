import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './ui.css'

const ToastContext = createContext(null)

const DURACION_MS = 4000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map())

  const remove = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = idRef.current + 1
      idRef.current = id
      setToasts((prev) => [...prev, { id, type, message }])
      const timer = setTimeout(() => remove(id), DURACION_MS)
      timersRef.current.set(id, timer)
      return id
    },
    [remove]
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="ui-toast-region" aria-live="polite">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`ui-toast ui-toast--${item.type}`}
            role={item.type === 'error' ? 'alert' : 'status'}
          >
            <span className="ui-toast__message">{item.message}</span>
            <button
              type="button"
              className="ui-toast__close"
              onClick={() => remove(item.id)}
              aria-label="Cerrar notificación"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return toast
}
