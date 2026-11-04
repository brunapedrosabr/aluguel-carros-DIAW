import { useId } from 'react'

/** Rótulo + input com mensagem de erro opcional. */
export default function Campo({ rotulo, erro, como = 'input', children, className = '', ...props }) {
  const idErro = useId()
  const Elemento = como
  return (
    <label className={`campo ${className}`}>
      {rotulo}
      <Elemento
        {...props}
        className={erro ? 'com-erro' : undefined}
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={erro ? idErro : undefined}
      >
        {children}
      </Elemento>
      {erro && (
        <span id={idErro} className="campo-erro">
          {erro}
        </span>
      )}
    </label>
  )
}
