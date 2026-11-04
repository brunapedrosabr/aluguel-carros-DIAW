/** Placa Mercosul do automóvel. */
export default function Placa({ placa, grande = false }) {
  return (
    <span className={`placa${grande ? ' grande' : ''}`} role="img" aria-label={`Placa ${placa}`}>
      <span className="placa-faixa" aria-hidden="true">
        {grande ? 'BRASIL' : null}
      </span>
      <span className="placa-numero" aria-hidden="true">
        {placa}
      </span>
    </span>
  )
}
