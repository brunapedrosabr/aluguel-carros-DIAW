import { useCallback, useEffect, useState } from 'react'
import Alerta from '../components/Alerta.jsx'
import Campo from '../components/Campo.jsx'
import Navbar from '../components/Navbar.jsx'
import Placa from '../components/Placa.jsx'
import StatusChip from '../components/StatusChip.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { agenteApi } from '../services/rodarApi.js'
import {
  formatarDataHora,
  formatarMoeda,
  formatarPeriodo,
  hojeISO,
  numeroPedido,
  plural,
  ROTULO_PROPRIETARIO,
} from '../utils/formatos.js'

const FILTROS = [
  { status: 'EM_ANALISE', rotulo: 'Aguardando parecer' },
  { status: 'APROVADO', rotulo: 'Parecer positivo' },
  { status: 'CONTRATADO', rotulo: 'Contratos executados' },
  { status: 'REPROVADO', rotulo: 'Reprovados' },
  { status: null, rotulo: 'Todos' },
]

const PROPRIETARIOS = ['CLIENTE', 'EMPRESA', 'BANCO']

/** Área dos agentes (empresas e bancos): análise financeira, parecer e execução do contrato. */
export default function AgentePainel() {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState('EM_ANALISE')
  const [itens, setItens] = useState(null)
  const [selecionadoId, setSelecionadoId] = useState(null)
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)

  const carregar = useCallback(async (status, manterId) => {
    setErro(null)
    try {
      const lista = await agenteApi.listar(status)
      setItens(lista)
      setSelecionadoId((atual) => {
        const alvo = manterId ?? atual
        return lista.some((i) => i.pedido.id === alvo) ? alvo : lista[0]?.pedido.id ?? null
      })
    } catch (e) {
      setErro(e.message)
      setItens([])
    }
  }, [])

  useEffect(() => {
    setItens(null)
    carregar(filtro)
  }, [filtro, carregar])

  const selecionado = itens?.find((i) => i.pedido.id === selecionadoId) ?? null

  function aposAcao(itemAtualizado, mensagem) {
    setAviso(mensagem)
    setItens((lista) => lista.map((i) => (i.pedido.id === itemAtualizado.pedido.id ? itemAtualizado : i)))
  }

  return (
    <div className="pagina">
      <Navbar />
      <main className="conteudo">
        <div className="cabecalho-pagina">
          <div>
            <p className="eyebrow">Painel do agente · {usuario?.nome}</p>
            <h1 className="titulo-pagina">Fila de análise financeira</h1>
            <p className="subtitulo">
              Avalie os pedidos e emita o parecer. Pedidos com parecer positivo seguem para a execução do contrato.
            </p>
          </div>
        </div>

        <div className="filtros" role="group" aria-label="Filtrar pedidos">
          {FILTROS.map((f) => (
            <button
              key={f.rotulo}
              type="button"
              className="filtro"
              aria-pressed={filtro === f.status}
              onClick={() => {
                setAviso(null)
                setFiltro(f.status)
              }}
            >
              {f.rotulo}
              {filtro === f.status && itens ? ` · ${itens.length}` : ''}
            </button>
          ))}
        </div>

        <Alerta tipo="sucesso">{aviso}</Alerta>
        <Alerta>{erro}</Alerta>

        {itens === null && <p className="carregando">Carregando pedidos…</p>}

        {itens?.length === 0 && !erro && (
          <section className="card vazio">
            <h2>Nada por aqui</h2>
            <p>Nenhum pedido neste filtro no momento.</p>
          </section>
        )}

        {itens?.length > 0 && (
          <div className="duas-colunas">
            <section className="principal" aria-label="Pedidos">
              <div className="tabela-caixa">
                <table className="tabela" style={{ minWidth: 640 }}>
                  <thead>
                    <tr>
                      <th scope="col">Pedido</th>
                      <th scope="col">Contratante</th>
                      <th scope="col">Renda declarada</th>
                      <th scope="col">Veículo</th>
                      <th scope="col">{filtro ? 'Crédito' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(({ pedido, contratante }) => {
                      const ativo = pedido.id === selecionadoId
                      return (
                        <tr
                          key={pedido.id}
                          className={`clicavel${ativo ? ' selecionada' : ''}`}
                          onClick={() => setSelecionadoId(pedido.id)}
                        >
                          <td className="numero">
                            <button
                              type="button"
                              className="link-botao"
                              aria-pressed={ativo}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelecionadoId(pedido.id)
                              }}
                            >
                              {numeroPedido(pedido.id)}
                            </button>
                          </td>
                          <td>
                            <strong style={{ fontWeight: 600 }}>{contratante.nome}</strong>
                            <span className="secundario">{contratante.profissao}</span>
                          </td>
                          <td>
                            <strong style={{ fontWeight: 600 }}>{formatarMoeda(contratante.rendaTotal)}</strong>
                            <span className="secundario">
                              {plural(contratante.rendimentos.length, 'fonte', 'fontes')}
                            </span>
                          </td>
                          <td>
                            {pedido.automovel.marca} {pedido.automovel.modelo} · {pedido.automovel.ano}
                          </td>
                          <td>
                            {filtro ? (
                              pedido.bancoCredito ? 'Sim' : 'Não'
                            ) : (
                              <StatusChip status={pedido.status} descricao={pedido.statusDescricao} />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {selecionado && (
              <DetalhePedido
                key={selecionado.pedido.id}
                item={selecionado}
                onAtualizado={aposAcao}
                onErro={setErro}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function DetalhePedido({ item, onAtualizado, onErro }) {
  const { pedido, contratante, podeAvaliar, podeExecutarContrato } = item
  const [justificativa, setJustificativa] = useState('')
  const [editando, setEditando] = useState(false)
  const [edicao, setEdicao] = useState({
    dataInicio: pedido.dataInicio,
    dataFim: pedido.dataFim,
    tipoProprietario: pedido.tipoProprietario,
  })
  const [enviando, setEnviando] = useState(false)

  async function executar(acao, mensagem) {
    onErro(null)
    setEnviando(true)
    try {
      const atualizado = await acao()
      onAtualizado(atualizado, mensagem)
      setEditando(false)
    } catch (e) {
      onErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  function emitirParecer(positivo) {
    if (!justificativa.trim()) {
      onErro('Escreva a justificativa do parecer.')
      return
    }
    executar(
      () => agenteApi.emitirParecer(pedido.id, positivo, justificativa.trim()),
      `Parecer ${positivo ? 'positivo' : 'negativo'} registrado para o pedido ${numeroPedido(pedido.id)}.`,
    )
  }

  function salvarModificacao(evento) {
    evento.preventDefault()
    executar(
      () =>
        agenteApi.modificar(pedido.id, {
          automovelId: pedido.automovel.id,
          dataInicio: edicao.dataInicio,
          dataFim: edicao.dataFim,
          tipoProprietario: edicao.tipoProprietario,
          bancoCreditoId: pedido.bancoCredito?.id ?? null,
        }),
      `Pedido ${numeroPedido(pedido.id)} modificado.`,
    )
  }

  return (
    <section className="lateral card detalhe-agente" aria-labelledby="titulo-detalhe" style={{ flexBasis: 380 }}>
      <div className="detalhe-topo">
        <div>
          <h2 id="titulo-detalhe">Pedido {numeroPedido(pedido.id)}</h2>
          <StatusChip status={pedido.status} descricao={pedido.statusDescricao} />
        </div>
        <p>
          Recebido em {formatarDataHora(pedido.criadoEm)}
          {pedido.podeModificar && !editando && (
            <>
              {' · '}
              <button type="button" className="link-botao" style={{ minHeight: 0 }} onClick={() => setEditando(true)}>
                Modificar pedido
              </button>
            </>
          )}
        </p>
      </div>

      <div className="detalhe-corpo">
        <div>
          <h3>Contratante</h3>
          <dl className="dados-compactos">
            <div>
              <dt>Nome</dt>
              <dd>{contratante.nome}</dd>
            </div>
            <div>
              <dt>Profissão</dt>
              <dd>{contratante.profissao}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{contratante.cpf}</dd>
            </div>
            <div>
              <dt>RG</dt>
              <dd>{contratante.rg}</dd>
            </div>
            {contratante.endereco && (
              <div className="inteiro">
                <dt>Endereço</dt>
                <dd>
                  {contratante.endereco.logradouro}
                  {contratante.endereco.bairro ? ` – ${contratante.endereco.bairro}` : ''}, {contratante.endereco.cidade}
                  /{contratante.endereco.uf}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h3>Rendimentos · máx. 3</h3>
          <ul className="lista-valores">
            {contratante.rendimentos.map((r) => (
              <li key={r.entidadeEmpregadora}>
                <span>{r.entidadeEmpregadora}</span>
                <span style={{ fontWeight: 600 }}>{formatarMoeda(r.valor)}</span>
              </li>
            ))}
            {contratante.rendimentos.length === 0 && (
              <li>
                <span style={{ color: 'var(--texto-suave)' }}>Nenhum rendimento informado</span>
              </li>
            )}
            <li className="total">
              <span>Total mensal</span>
              <span>{formatarMoeda(contratante.rendaTotal)}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3>Pedido</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <Placa placa={pedido.automovel.placa} />
            <span>
              <strong style={{ display: 'block' }}>
                {pedido.automovel.marca} {pedido.automovel.modelo} · {pedido.automovel.ano}
              </strong>
              <span style={{ fontSize: 14, color: 'var(--texto-suave)' }}>
                {formatarPeriodo(pedido.dataInicio, pedido.dataFim)} · {plural(pedido.diarias, 'diária', 'diárias')}
              </span>
            </span>
          </div>
          <p className="dica" style={{ color: 'var(--texto-2)' }}>
            {pedido.bancoCredito ? `Crédito solicitado ao ${pedido.bancoCredito.nome}` : 'Sem contrato de crédito'} ·{' '}
            {ROTULO_PROPRIETARIO[pedido.tipoProprietario].toLowerCase()}
          </p>
        </div>

        {editando && (
          <form className="pilha" style={{ gap: 14 }} onSubmit={salvarModificacao}>
            <h3 style={{ margin: 0 }}>Modificar pedido</h3>
            <div className="grade" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <Campo
                rotulo="Retirada"
                type="date"
                min={hojeISO()}
                value={edicao.dataInicio}
                onChange={(e) => setEdicao({ ...edicao, dataInicio: e.target.value })}
              />
              <Campo
                rotulo="Devolução"
                type="date"
                min={edicao.dataInicio}
                value={edicao.dataFim}
                onChange={(e) => setEdicao({ ...edicao, dataFim: e.target.value })}
              />
            </div>
            <Campo
              como="select"
              rotulo="Registro do veículo"
              value={edicao.tipoProprietario}
              onChange={(e) => setEdicao({ ...edicao, tipoProprietario: e.target.value })}
            >
              {PROPRIETARIOS.filter((p) => p !== 'BANCO' || pedido.bancoCredito).map((p) => (
                <option key={p} value={p}>
                  {ROTULO_PROPRIETARIO[p]}
                </option>
              ))}
            </Campo>
            <div className="acoes-form">
              <button type="button" className="btn btn-texto" onClick={() => setEditando(false)}>
                Descartar
              </button>
              <button type="submit" className="btn btn-secundario" disabled={enviando}>
                Salvar modificação
              </button>
            </div>
          </form>
        )}

        {pedido.parecer && (
          <div>
            <h3>Parecer · {pedido.agenteAvaliador?.nome}</h3>
            <p style={{ margin: 0 }}>{pedido.parecer}</p>
          </div>
        )}

        {pedido.contrato && (
          <div>
            <h3>Contrato</h3>
            <p style={{ margin: 0 }}>
              Executado em {formatarDataHora(pedido.contrato.dataExecucao)} por {pedido.contrato.agenteResponsavel?.nome}.
              {pedido.contrato.bancoCredito && ` Contrato de crédito concedido pelo ${pedido.contrato.bancoCredito.nome}.`}
            </p>
          </div>
        )}

        {podeAvaliar && (
          <Campo
            como="textarea"
            rotulo="Parecer financeiro"
            rows={3}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Descreva a análise e a justificativa da decisão…"
            maxLength={1000}
          />
        )}

        {podeExecutarContrato && (
          <p className="dica">Você emitiu parecer positivo. Execute o contrato para concluir o aluguel.</p>
        )}
      </div>

      {podeAvaliar && (
        <div className="detalhe-acoes">
          <button type="button" className="btn btn-perigo" disabled={enviando} onClick={() => emitirParecer(false)}>
            Parecer negativo
          </button>
          <button type="button" className="btn btn-primario" disabled={enviando} onClick={() => emitirParecer(true)}>
            Parecer positivo
          </button>
        </div>
      )}

      {podeExecutarContrato && (
        <div className="detalhe-acoes">
          <button
            type="button"
            className="btn btn-primario"
            disabled={enviando}
            onClick={() =>
              executar(
                () => agenteApi.executarContrato(pedido.id),
                `Contrato do pedido ${numeroPedido(pedido.id)} executado.`,
              )
            }
          >
            Executar contrato
          </button>
        </div>
      )}
    </section>
  )
}
