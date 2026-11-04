import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta.jsx'
import Icone from '../components/Icone.jsx'
import Navbar from '../components/Navbar.jsx'
import Placa from '../components/Placa.jsx'
import StatusChip from '../components/StatusChip.jsx'
import Trajeto from '../components/Trajeto.jsx'
import { pedidoApi } from '../services/rodarApi.js'
import {
  formatarData,
  formatarDataCurta,
  formatarDataHora,
  formatarPeriodo,
  numeroPedido,
  plural,
  ROTULO_PROPRIETARIO,
} from '../utils/formatos.js'

const FILTROS = [
  { id: 'TODOS', rotulo: 'Todos', status: null },
  { id: 'EM_ANALISE', rotulo: 'Em análise', status: ['EM_ANALISE'] },
  { id: 'APROVADO', rotulo: 'Aprovados', status: ['APROVADO'] },
  { id: 'CONTRATADO', rotulo: 'Contratados', status: ['CONTRATADO'] },
  { id: 'ENCERRADOS', rotulo: 'Encerrados', status: ['REPROVADO', 'CANCELADO'] },
]

function escolherDestaque(pedidos) {
  return pedidos.find((p) => p.status === 'EM_ANALISE' || p.status === 'APROVADO') ?? pedidos[0] ?? null
}

export default function MeusPedidos() {
  const location = useLocation()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState(null)
  const [destaqueId, setDestaqueId] = useState(null)
  const [filtro, setFiltro] = useState('TODOS')
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(location.state?.aviso ?? null)
  const [cancelando, setCancelando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const lista = await pedidoApi.listar()
      setPedidos(lista)
      setDestaqueId((atual) => (lista.some((p) => p.id === atual) ? atual : escolherDestaque(lista)?.id ?? null))
    } catch (e) {
      setErro(e.message)
      setPedidos([])
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    // limpa o aviso do histórico para não reaparecer ao recarregar a página
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const destaque = pedidos?.find((p) => p.id === destaqueId) ?? null
  const filtroAtual = FILTROS.find((f) => f.id === filtro)
  const visiveis = useMemo(
    () => (pedidos ?? []).filter((p) => !filtroAtual.status || filtroAtual.status.includes(p.status)),
    [pedidos, filtroAtual],
  )

  function contar(f) {
    return (pedidos ?? []).filter((p) => !f.status || f.status.includes(p.status)).length
  }

  function verPedido(id) {
    setDestaqueId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function cancelar() {
    if (!destaque) return
    if (!window.confirm(`Cancelar o pedido ${numeroPedido(destaque.id)}?`)) return
    setErro(null)
    setCancelando(true)
    try {
      await pedidoApi.cancelar(destaque.id)
      setAviso(`Pedido ${numeroPedido(destaque.id)} cancelado.`)
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div className="pagina">
      <Navbar />
      <main className="conteudo">
        <div className="cabecalho-pagina">
          <div>
            <p className="eyebrow">Painel do cliente</p>
            <h1 className="titulo-pagina">Meus pedidos</h1>
          </div>
          <Link to="/cliente/pedidos/novo" className="btn btn-primario">
            <Icone nome="mais" espessura={2.4} /> Novo pedido
          </Link>
        </div>

        <Alerta tipo="sucesso">{aviso}</Alerta>
        <Alerta>{erro}</Alerta>

        {pedidos === null && <p className="carregando">Carregando pedidos…</p>}

        {pedidos?.length === 0 && !erro && (
          <section className="card vazio">
            <h2>Nenhum pedido ainda</h2>
            <p>Escolha um automóvel e o período para enviar seu primeiro pedido de aluguel.</p>
            <Link to="/cliente/pedidos/novo" className="btn btn-primario">
              <Icone nome="mais" espessura={2.4} /> Fazer um pedido
            </Link>
          </section>
        )}

        {destaque && (
          <section className="card" aria-labelledby="pedido-destaque">
            <div className="pedido-destaque-topo">
              <div>
                <h2 id="pedido-destaque">Pedido {numeroPedido(destaque.id)}</h2>
                <StatusChip status={destaque.status} descricao={destaque.statusDescricao} />
              </div>
              <p>Enviado em {formatarDataHora(destaque.criadoEm)}</p>
            </div>

            <div className="pedido-destaque-corpo">
              <div className="pedido-veiculo">
                <Placa placa={destaque.automovel.placa} grande />
                <div>
                  <p className="nome">
                    {destaque.automovel.marca} {destaque.automovel.modelo}
                  </p>
                  <p className="detalhe">
                    {destaque.automovel.ano} · Matrícula {destaque.automovel.matricula}
                  </p>
                </div>
              </div>
              <dl className="dados">
                <div>
                  <dt>Período</dt>
                  <dd>
                    {formatarDataCurta(destaque.dataInicio)} → {formatarData(destaque.dataFim)}
                  </dd>
                </div>
                <div>
                  <dt>Diárias</dt>
                  <dd>{plural(destaque.diarias, 'diária', 'diárias')}</dd>
                </div>
                <div>
                  <dt>Contrato de crédito</dt>
                  <dd>{destaque.bancoCredito ? `Sim · ${destaque.bancoCredito.nome}` : 'Não'}</dd>
                </div>
                <div>
                  <dt>Registro do veículo</dt>
                  <dd>{ROTULO_PROPRIETARIO[destaque.tipoProprietario]}</dd>
                </div>
              </dl>
            </div>

            <div className="pedido-trajeto">
              <Trajeto pedido={destaque} />
            </div>

            {destaque.parecer && (
              <div className="parecer-caixa">
                <strong>Parecer de {destaque.agenteAvaliador?.nome}</strong>
                {destaque.parecer}
              </div>
            )}

            {destaque.contrato && (
              <div className="parecer-caixa">
                <strong>Contrato</strong>
                Executado em {formatarDataHora(destaque.contrato.dataExecucao)} por{' '}
                {destaque.contrato.agenteResponsavel?.nome}.{' '}
                {destaque.contrato.bancoCredito
                  ? `Crédito concedido pelo ${destaque.contrato.bancoCredito.nome}.`
                  : 'Sem contrato de crédito.'}
              </div>
            )}

            {(destaque.podeModificar || destaque.podeCancelar) && (
              <div className="pedido-acoes">
                {destaque.podeModificar && (
                  <Link to={`/cliente/pedidos/${destaque.id}/editar`} className="btn btn-secundario">
                    Modificar pedido
                  </Link>
                )}
                {destaque.podeCancelar && (
                  <button type="button" className="btn btn-perigo-texto" onClick={cancelar} disabled={cancelando}>
                    {cancelando ? 'Cancelando…' : 'Cancelar pedido'}
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {pedidos?.length > 0 && (
          <section aria-labelledby="historico" className="pilha" style={{ gap: 16 }}>
            <div className="linha-entre" style={{ gap: 12 }}>
              <h2 id="historico" className="secao-titulo">
                Histórico de pedidos
              </h2>
              <div className="filtros" role="group" aria-label="Filtrar por status">
                {FILTROS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="filtro"
                    aria-pressed={filtro === f.id}
                    onClick={() => setFiltro(f.id)}
                  >
                    {f.rotulo} · {contar(f)}
                  </button>
                ))}
              </div>
            </div>

            <div className="tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">Pedido</th>
                    <th scope="col">Veículo</th>
                    <th scope="col">Período</th>
                    <th scope="col">Agente</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((p) => (
                    <tr key={p.id} className={p.id === destaqueId ? 'selecionada' : undefined}>
                      <td className="numero">{numeroPedido(p.id)}</td>
                      <td>
                        <div className="veiculo-celula">
                          <Placa placa={p.automovel.placa} />
                          <span>
                            {p.automovel.marca} {p.automovel.modelo} · {p.automovel.ano}
                          </span>
                        </div>
                      </td>
                      <td>{formatarPeriodo(p.dataInicio, p.dataFim)}</td>
                      <td>{p.agenteAvaliador?.nome ?? p.bancoCredito?.nome ?? '—'}</td>
                      <td>
                        <StatusChip status={p.status} descricao={p.statusDescricao} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="link-botao" onClick={() => verPedido(p.id)}>
                          Ver <span className="sr-only">pedido {numeroPedido(p.id)}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visiveis.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ color: 'var(--texto-suave)' }}>
                        Nenhum pedido neste filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
