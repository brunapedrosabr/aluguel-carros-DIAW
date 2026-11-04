import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta.jsx'
import FormCliente from '../components/FormCliente.jsx'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { definirAviso } from '../services/aviso.js'
import { clienteApi } from '../services/rodarApi.js'

/** CRUD de cliente — Read, Update e Delete do próprio cadastro. */
export default function MeuCadastro() {
  const { atualizarUsuario, sair } = useAuth()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [erroCarga, setErroCarga] = useState(null)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true
    clienteApi
      .meuCadastro()
      .then((dados) => ativo && setCliente(dados))
      .catch((e) => ativo && setErroCarga(e.message))
    return () => {
      ativo = false
    }
  }, [])

  async function salvar(dados) {
    setErro(null)
    setSucesso(null)
    setEnviando(true)
    try {
      const atualizado = await clienteApi.atualizar(dados)
      setCliente(atualizado)
      setVersao((v) => v + 1)
      atualizarUsuario({ nome: atualizado.nome, login: atualizado.login })
      setSucesso('Cadastro atualizado.')
    } catch (e) {
      setErro(e)
    } finally {
      setEnviando(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function excluir() {
    const confirmado = window.confirm('Excluir sua conta? Seus dados serão removidos e essa ação não pode ser desfeita.')
    if (!confirmado) return
    setErro(null)
    try {
      await clienteApi.excluir()
      definirAviso('Seu cadastro foi excluído.')
      sair()
      navigate('/login', { replace: true })
    } catch (e) {
      setErro(e)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="pagina">
      <Navbar />
      <main className="conteudo">
        <div className="cabecalho-pagina">
          <div>
            <p className="eyebrow">Painel do cliente</p>
            <h1 className="titulo-pagina">Meu cadastro</h1>
            <p className="subtitulo">
              Mantenha seus dados atualizados — os agentes usam essas informações na análise financeira dos seus pedidos.
            </p>
          </div>
        </div>

        <Alerta tipo="sucesso">{sucesso}</Alerta>
        <Alerta>{erroCarga}</Alerta>
        {!cliente && !erroCarga && <p className="carregando">Carregando…</p>}

        {cliente && (
          <FormCliente
            key={versao}
            modo="editar"
            inicial={cliente}
            onEnviar={salvar}
            erro={erro}
            extra={
              <section className="zona-perigo" aria-labelledby="titulo-excluir">
                <div>
                  <h2 id="titulo-excluir">Excluir cadastro</h2>
                  <p>Remove sua conta e seus dados do sistema. Essa ação não pode ser desfeita.</p>
                </div>
                <button type="button" className="btn btn-perigo" onClick={excluir}>
                  Excluir minha conta
                </button>
              </section>
            }
          >
            <Link to="/cliente/pedidos" className="btn btn-secundario">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primario" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </FormCliente>
        )}
      </main>
    </div>
  )
}
