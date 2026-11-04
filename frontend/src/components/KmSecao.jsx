import { useId } from 'react'

/** Seção de formulário numerada como um marco quilométrico (KM 01, KM 02...). */
export default function KmSecao({ km, titulo, descricao, children }) {
  const id = useId()
  return (
    <section className="card km-secao" aria-labelledby={id}>
      <div className="km-cabecalho">
        <span className="km-badge" aria-hidden="true">
          <small>KM</small>
          <span>{String(km).padStart(2, '0')}</span>
        </span>
        <div>
          <h2 id={id}>{titulo}</h2>
          {descricao && <p>{descricao}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
