import { cloneElement, useId } from 'react'
import './ui.css'

export default function Field({
  label,
  id,
  help,
  error,
  children,
  className = '',
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const helpId = help ? `${fieldId}-help` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy =
    [helpId, errorId].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id: fieldId,
    className: ['ui-field__control', children.props.className]
      .filter(Boolean)
      .join(' '),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  })

  return (
    <div className={['ui-field', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="ui-field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      {control}
      {help && (
        <p className="ui-field__help" id={helpId}>
          {help}
        </p>
      )}
      {error && (
        <p className="ui-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
