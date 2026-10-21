import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import Button from './Button'
import './ui.css'

const ConfirmContext = createContext(null)

export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  text = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="ui-modal-overlay">
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-confirm-title"
        aria-describedby={text ? 'ui-confirm-text' : undefined}
      >
        <h2 className="ui-modal__title" id="ui-confirm-title">
          {title}
        </h2>
        {text && (
          <p className="ui-modal__text" id="ui-confirm-text">
            {text}
          </p>
        )}
        <div className="ui-modal__actions">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolverRef = useRef(null)

  const confirm = useCallback(
    (opciones) =>
      new Promise((resolve) => {
        resolverRef.current = resolve
        setOptions(
          typeof opciones === 'string' ? { text: opciones } : (opciones ?? {})
        )
      }),
    []
  )

  const settle = useCallback((result) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setOptions(null)
    resolve?.(result)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={Boolean(options)}
        title={options?.title ?? 'Confirmar acción'}
        text={options?.text ?? options?.message ?? ''}
        confirmText={options?.confirmText ?? 'Confirmar'}
        cancelText={options?.cancelText ?? 'Cancelar'}
        confirmVariant={options?.confirmVariant ?? 'primary'}
        onCancel={() => settle(false)}
        onConfirm={() => settle(true)}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) {
    throw new Error('useConfirm debe usarse dentro de ConfirmProvider')
  }
  return confirm
}
