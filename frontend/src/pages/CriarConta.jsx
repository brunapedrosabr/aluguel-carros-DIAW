import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import FormCliente from '../components/FormCliente.jsx'
import Icone from '../components/Icone.jsx'
import Logo from '../components/Logo.jsx'
import { rotaInicial, useAuth } from '../context/AuthContext.jsx'
import { authApi } from '../services/rodarApi.js'

/** CRUD de cliente — Create: cadastro prévio exigido para usar o sistema. */
export default function CriarConta() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  // evita que o redirecionamento de "já logado" atropele a navegação com a mensagem de boas-vindas
  const acabouDeCadastrar = useRef(false)

  if (usuario && !acabouDeCadastrar.current) return <Navigate to={rotaInicial(usuario)} replace />

  async function cadastrar(dados) {
    setErro(null)
    setEnviando(true)
    try {
      const sessao = await authApi.registrar(dados)
      acabouDeCadastrar.current = true
      entrar(sessao)
      navigate('/cliente/pedidos', {
        replace: true,
        state: { aviso: 'Conta criada! Agora você já pode fazer seu primeiro pedido.' },
      })
    } catch (e) {
      setErro(e)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina">
      <header className="topo">
        <div className="topo-interno" style={{ justifyContent: 'space-between' }}>
          <Logo para="/login" />
          <p style={{ margin: 0, fontSize: 15, color: 'var(--texto-nav)' }}>
            Já tem cadastro?{' '}
            <Link to="/login" style={{ color: '#fff', fontWeight: 700 }}>
              Entrar
            </Link>
          </p>
        </div>
      </header>

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <div>
            <p className="eyebrow">Novo cliente</p>
            <h1 className="titulo-pagina">Criar conta</h1>
            <p className="subtitulo">
              Cadastre-se para fazer pedidos de aluguel. Os agentes usam essas informações na análise financeira.
            </p>
          </div>
        </div>

        <FormCliente modo="criar" onEnviar={cadastrar} erro={erro}>
          <Link to="/login" className="btn btn-texto">
            Voltar ao login
          </Link>
          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? 'Criando…' : 'Criar conta'} <Icone nome="seta" tamanho={20} espessura={2.2} />
          </button>
        </FormCliente>
      </main>
    </div>
  )
}
