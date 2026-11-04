/** "2026-11-02T21:05:00" (LocalDateTime) → "02/11" no fuso do navegador. */
function dataCurta(dataHora) {
  if (!dataHora) return null
  const data = new Date(dataHora)
  if (Number.isNaN(data.getTime())) return null
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** Andamento do pedido como um trecho de estrada: enviado → análise → parecer → contrato. */
function etapas(pedido) {
  const enviado = { titulo: 'Pedido enviado', estado: 'feito', detalhe: `${dataCurta(pedido.criadoEm)} · concluído` }
  const avaliado = dataCurta(pedido.avaliadoEm)

  switch (pedido.status) {
    case 'EM_ANALISE':
      return [
        enviado,
        { titulo: 'Análise financeira', estado: 'atual', detalhe: 'Em andamento' },
        { titulo: 'Parecer do agente', estado: 'pendente', detalhe: 'Aguardando' },
        { titulo: 'Contrato executado', estado: 'pendente', detalhe: 'Aguardando' },
      ]
    case 'APROVADO':
      return [
        enviado,
        { titulo: 'Análise financeira', estado: 'feito', detalhe: 'Concluída' },
        { titulo: 'Parecer positivo', estado: 'feito', detalhe: `${avaliado} · ${pedido.agenteAvaliador?.nome ?? ''}` },
        { titulo: 'Execução do contrato', estado: 'atual', detalhe: 'Aguardando o agente' },
      ]
    case 'REPROVADO':
      return [
        enviado,
        { titulo: 'Análise financeira', estado: 'feito', detalhe: 'Concluída' },
        { titulo: 'Parecer negativo', estado: 'negativo', detalhe: `${avaliado} · ${pedido.agenteAvaliador?.nome ?? ''}` },
        { titulo: 'Contrato executado', estado: 'pendente', detalhe: 'Não se aplica' },
      ]
    case 'CONTRATADO':
      return [
        enviado,
        { titulo: 'Análise financeira', estado: 'feito', detalhe: 'Concluída' },
        { titulo: 'Parecer positivo', estado: 'feito', detalhe: `${avaliado} · ${pedido.agenteAvaliador?.nome ?? ''}` },
        { titulo: 'Contrato executado', estado: 'feito', detalhe: dataCurta(pedido.contrato?.dataExecucao) ?? 'Concluído' },
      ]
    default:
      return [
        enviado,
        { titulo: 'Pedido cancelado', estado: 'negativo', detalhe: 'Cancelado pelo cliente' },
      ]
  }
}

export default function Trajeto({ pedido }) {
  return (
    <ol className="trajeto" aria-label="Andamento do pedido">
      {etapas(pedido).map((etapa) => (
        <li key={etapa.titulo} className={etapa.estado}>
          <span className="trajeto-barra" aria-hidden="true" />
          <span className="trajeto-rotulo">
            <strong>{etapa.titulo}</strong>
            <span>{etapa.detalhe}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
