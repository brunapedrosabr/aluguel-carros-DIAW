import { Link } from 'react-router-dom'

/** Logo em formato de placa Mercosul. */
export default function Logo({ para, grande = false }) {
  const conteudo = (
    <>
      <span className="logo-faixa">ALUGUEL · BRASIL</span>
      <span className="logo-nome">RODAR</span>
    </>
  )
  const classe = `logo${grande ? ' grande' : ''}`
  if (para) {
    return (
      <Link to={para} className={classe} aria-label="Rodar — início">
        {conteudo}
      </Link>
    )
  }
  return (
    <div className={classe} role="img" aria-label="Rodar">
      {conteudo}
    </div>
  )
}
