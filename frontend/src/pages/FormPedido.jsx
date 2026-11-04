import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alerta from '../components/Alerta.jsx'
import Campo from '../components/Campo.jsx'
import Icone from '../components/Icone.jsx'
import KmSecao from '../components/KmSecao.jsx'
import Navbar from '../components/Navbar.jsx'
import Placa from '../components/Placa.jsx'
import { catalogoApi, pedidoApi } from '../services/rodarApi.js'
import { contarDiarias, formatarData, hojeISO, numeroPedido, plural, ROTULO_PROPRIETARIO } from '../utils/formatos.js'

const PROPRIETARIOS = [
  { valor: 'CLIENTE', rotulo: 'Cliente' },
  { valor: 'EMPRESA', rotulo: 'Empresa' },
  { valor: 'BANCO', rotulo: 'Banco' },
]

/** Introduzir (novo) ou modificar (editar) um pedido de aluguel. */
export default function FormPedido() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [automoveis, setAutomoveis] = useState(null)
  const [bancos, setBancos] = useState([])
  const [pedidoOriginal, setPedidoOriginal] = useState(null)
  const [form, setForm] = useState({
    automovelId: null,
    dataInicio: '',
    dataFim: '',
    comCredito: false,
    bancoCreditoId: '',
    tipoProprietario: 'CLIENTE',
  })
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const [listaAutomoveis, listaBancos, pedido] = await Promise.all([
          catalogoApi.automoveis(),
          catalogoApi.bancos(),
          editando ? pedidoApi.buscar(id) : Promise.resolve(null),
        ])
        if (!ativo) return
        setAutomoveis(listaAutomoveis)
        setBancos(listaBancos)
        if (pedido) {
          setPedidoOriginal(pedido)
          setForm({
            automovelId: pedido.automovel.id,
            dataInicio: pedido.dataInicio,
            dataFim: pedido.dataFim,
            comCredito: Boolean(pedido.bancoCredito),
            bancoCreditoId: pedido.bancoCredito ? String(pedido.bancoCredito.id) : String(listaBancos[0]?.id ?? ''),
            tipoProprietario: pedido.tipoProprietario,
          })
        } else {
          setForm((atual) => ({
            ...atual,
            automovelId: listaAutomoveis[0]?.id ?? null,
            bancoCreditoId: String(listaBancos[0]?.id ?? ''),
          }))
        }
      } catch (e) {
        if (ativo) {
          setErro(e.message)
          setAutomoveis([])
        }
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [editando, id])

  const bloqueado = editando && pedidoOriginal && !pedidoOriginal.podeModificar
  const automovel = automoveis?.find((a) => a.id === form.automovelId)
  const banco = bancos.find((b) => String(b.id) === form.bancoCreditoId)
  const diarias = contarDiarias(form.dataInicio, form.dataFim)

  function atualizar(campos) {
    setForm((atual) => {
      const novo = { ...atual, ...campos }
      // registro em nome do banco só existe com contrato de crédito
      if (!novo.comCredito && novo.tipoProprietario === 'BANCO') novo.tipoProprietario = 'CLIENTE'
      return novo
    })
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    if (!form.automovelId) return setErro('Selecione um automóvel.')
    if (!form.dataInicio || !form.dataFim) return setErro('Informe as datas de retirada e devolução.')
    if (diarias <= 0) return setErro('A data de devolução deve ser posterior à data de retirada.')
    if (form.comCredito && !form.bancoCreditoId) return setErro('Escolha o banco do contrato de crédito.')

    const corpo = {
      automovelId: form.automovelId,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      tipoProprietario: form.tipoProprietario,
      bancoCreditoId: form.comCredito ? Number(form.bancoCreditoId) : null,
    }
    setEnviando(true)
    try {
      const salvo = editando ? await pedidoApi.modificar(id, corpo) : await pedidoApi.criar(corpo)
      navigate('/cliente/pedidos', {
        state: {
          aviso: editando
            ? `Pedido ${numeroPedido(salvo.id)} atualizado.`
            : `Pedido ${numeroPedido(salvo.id)} enviado para análise.`,
        },
      })
    } catch (e) {
      setErro(e.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina">
      <Navbar />
      <main className="conteudo">
        <div className="cabecalho-pagina">
          <div>
            <nav aria-label="Trilha" className="trilha">
              <Link to="/cliente/pedidos">Meus pedidos</Link> <span aria-hidden="true">/</span>{' '}
              {editando ? `Pedido ${numeroPedido(id)}` : 'Novo pedido'}
            </nav>
            <h1 className="titulo-pagina">{editando ? 'Modificar pedido' : 'Novo pedido de aluguel'}</h1>
            <p className="subtitulo">
              Escolha o automóvel, o período e, se quiser, um contrato de crédito. Depois de enviado, o pedido segue
              para a análise financeira de um agente.
            </p>
          </div>
        </div>

        <Alerta>{erro}</Alerta>
        {bloqueado && (
          <Alerta tipo="info">
            Este pedido está com status “{pedidoOriginal.statusDescricao}” e não pode mais ser modificado.
          </Alerta>
        )}
        {automoveis === null && <p className="carregando">Carregando…</p>}

        {automoveis && (
          <form className="duas-colunas" onSubmit={enviar} noValidate>
            <fieldset className="principal" disabled={bloqueado} style={{ border: 0, margin: 0, padding: 0 }}>
              <KmSecao km={1} titulo="Automóvel" descricao="Selecione um dos veículos disponíveis.">
                <div className="carros" role="radiogroup" aria-label="Automóvel">
                  {automoveis.map((a) => {
                    const selecionado = a.id === form.automovelId
                    return (
                      <label key={a.id} className={`carro${selecionado ? ' selecionado' : ''}`}>
                        <input
                          type="radio"
                          name="automovel"
                          checked={selecionado}
                          onChange={() => atualizar({ automovelId: a.id })}
                        />
                        <span className="carro-imagem" aria-hidden="true">
                          <Icone nome="carro" tamanho={64} espessura={1.3} />
                        </span>
                        {selecionado && <span className="carro-selo">Selecionado</span>}
                        <span className="carro-nome">
                          <strong>
                            {a.marca} {a.modelo}
                          </strong>
                          <span>
                            {a.ano} · Mat. {a.matricula}
                          </span>
                        </span>
                        <Placa placa={a.placa} />
                      </label>
                    )
                  })}
                </div>
              </KmSecao>

              <KmSecao km={2} titulo="Período" descricao="Datas de retirada e devolução do automóvel.">
                <div className="grade">
                  <Campo
                    rotulo="Retirada"
                    type="date"
                    min={hojeISO()}
                    value={form.dataInicio}
                    onChange={(e) => atualizar({ dataInicio: e.target.value })}
                    required
                  />
                  <Campo
                    rotulo="Devolução"
                    type="date"
                    min={form.dataInicio || hojeISO()}
                    value={form.dataFim}
                    onChange={(e) => atualizar({ dataFim: e.target.value })}
                    required
                  />
                </div>
                <p className="dica" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icone nome="calendario" tamanho={16} />
                  Duração: <strong style={{ color: 'var(--texto)' }}>{diarias ? plural(diarias, 'diária', 'diárias') : '—'}</strong>
                </p>
              </KmSecao>

              <KmSecao km={3} titulo="Contrato de crédito" descricao="Opcional — concedido por um dos bancos agentes.">
                <div className="opcoes-cartao" role="radiogroup" aria-label="Contrato de crédito">
                  <label className={`opcao${!form.comCredito ? ' selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="credito"
                      checked={!form.comCredito}
                      onChange={() => atualizar({ comCredito: false })}
                    />
                    <span>
                      <strong>Sem crédito</strong>
                      <span>Aluguel sem financiamento bancário.</span>
                    </span>
                  </label>
                  <label className={`opcao${form.comCredito ? ' selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="credito"
                      checked={form.comCredito}
                      onChange={() => atualizar({ comCredito: true })}
                      disabled={bancos.length === 0}
                    />
                    <span>
                      <strong>Com contrato de crédito</strong>
                      <span>O banco escolhido avalia o pedido e concede o crédito.</span>
                    </span>
                  </label>
                </div>

                <div className="grade" style={{ alignItems: 'end' }}>
                  <Campo
                    como="select"
                    rotulo="Banco agente"
                    value={form.bancoCreditoId}
                    onChange={(e) => atualizar({ bancoCreditoId: e.target.value })}
                    disabled={!form.comCredito}
                  >
                    {bancos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nome}
                      </option>
                    ))}
                  </Campo>

                  <div className="campo" role="radiogroup" aria-labelledby="rotulo-registro">
                    <span id="rotulo-registro">Automóvel registrado em nome de</span>
                    <div className="segmentado">
                      {PROPRIETARIOS.map((p) => {
                        const desabilitado = p.valor === 'BANCO' && !form.comCredito
                        const selecionado = form.tipoProprietario === p.valor
                        return (
                          <label
                            key={p.valor}
                            className={`${selecionado ? 'selecionado' : ''}${desabilitado ? ' desabilitado' : ''}`}
                            title={desabilitado ? 'Disponível apenas com contrato de crédito' : undefined}
                          >
                            <input
                              type="radio"
                              name="proprietario"
                              checked={selecionado}
                              disabled={desabilitado}
                              onChange={() => atualizar({ tipoProprietario: p.valor })}
                            />
                            {p.rotulo}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </KmSecao>
            </fieldset>

            <aside className="lateral resumo" aria-labelledby="titulo-resumo">
              <div className="resumo-topo">
                <h2 id="titulo-resumo">Resumo do pedido</h2>
                {automovel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Placa placa={automovel.placa} />
                    <span>
                      <strong style={{ display: 'block', color: '#fff', fontSize: 17 }}>
                        {automovel.marca} {automovel.modelo}
                      </strong>
                      <span style={{ fontSize: 14, color: 'var(--texto-claro)' }}>
                        {automovel.ano} · Mat. {automovel.matricula}
                      </span>
                    </span>
                  </div>
                )}
                <dl>
                  <div>
                    <dt>Retirada</dt>
                    <dd>{form.dataInicio ? formatarData(form.dataInicio) : '—'}</dd>
                  </div>
                  <div>
                    <dt>Devolução</dt>
                    <dd>{form.dataFim ? formatarData(form.dataFim) : '—'}</dd>
                  </div>
                  <div>
                    <dt>Duração</dt>
                    <dd>{diarias ? plural(diarias, 'diária', 'diárias') : '—'}</dd>
                  </div>
                  <div>
                    <dt>Crédito</dt>
                    <dd>{form.comCredito ? banco?.nome ?? '—' : 'Sem crédito'}</dd>
                  </div>
                  <div>
                    <dt>Registro</dt>
                    <dd>{ROTULO_PROPRIETARIO[form.tipoProprietario]}</dd>
                  </div>
                </dl>
              </div>
              <div className="faixa" aria-hidden="true" style={{ marginTop: 16 }} />
              <div className="resumo-rodape">
                <p>
                  {editando ? (
                    <>Alterações só são aceitas enquanto o pedido estiver <strong>Em análise</strong>.</>
                  ) : (
                    <>
                      Ao enviar, o pedido fica <strong>Em análise</strong> até o parecer do agente. Enquanto isso, você
                      ainda pode modificá-lo ou cancelá-lo.
                    </>
                  )}
                </p>
                <button type="submit" className="btn btn-primario btn-bloco" disabled={enviando || bloqueado}>
                  {enviando ? 'Enviando…' : editando ? 'Salvar alterações' : 'Enviar para análise'}
                  <Icone nome="seta" tamanho={20} espessura={2.2} />
                </button>
                <Link to="/cliente/pedidos" className="btn btn-texto btn-bloco">
                  Cancelar
                </Link>
              </div>
            </aside>
          </form>
        )}
      </main>
    </div>
  )
}
