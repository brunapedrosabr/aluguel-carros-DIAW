/** Status do pedido no formato de plaquinha de sinalização. */
export default function StatusChip({ status, descricao }) {
  return <span className={`status status-${status}`}>{descricao}</span>
}
