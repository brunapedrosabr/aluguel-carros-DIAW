export default function Alerta({ tipo = 'erro', children }) {
  if (!children) return null
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span className="losango" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
