import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta.jsx'
import Campo from '../components/Campo.jsx'
import Icone from '../components/Icone.jsx'
import Logo from '../components/Logo.jsx'
import { ehAgente, rotaInicial, useAuth } from '../context/AuthContext.jsx'
import { lerAviso, limparAviso } from '../services/aviso.js'
import { authApi } from '../services/rodarApi.js'

export default function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tipo, setTipo] = useState('cliente')
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso] = useState(() => location.state?.aviso ?? lerAviso())

  useEffect(() => {
    limparAviso()
  }, [])

  if (usuario) return <Navigate to={rotaInicial(usuario)} replace />

  async function enviar(evento) {
    evento.preventDefault()
    setErro(null)
    if (!login.trim() || !senha) {
      setErro('Informe usuário e senha.')
      return
    }
    setEnviando(true)
    try {
      const sessao = await authApi.login(login.trim(), senha)
      const agente = ehAgente(sessao.usuario)
      if (tipo === 'agente' && !agente) {
        setErro('Este usuário é um cliente. Selecione "Sou cliente" para entrar.')
        return
      }
      if (tipo === 'cliente' && agente) {
        setErro('Este usuário é um agente. Selecione "Sou agente" para entrar.')
        return
      }
      entrar(sessao)
      navigate(rotaInicial(sessao.usuario), { replace: true })
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <section className="login-apresentacao" aria-label="Apresentação do sistema">
        <div className="login-topo">
          <Logo grande />
          <span className="placa-km">KM 02</span>
        </div>

        <div className="login-texto">
          <p className="eyebrow">Sistema de aluguel de automóveis</p>
          <h1>Seu próximo trajeto começa aqui.</h1>
          <p>
            Faça, acompanhe e ajuste pedidos de aluguel pela internet. Empresas e bancos parceiros avaliam cada pedido
            antes da execução do contrato.
          </p>
        </div>

        <ul className="lista-icones">
          <li>
            <span className="icone-caixa" aria-hidden="true">
              <Icone nome="usuario" />
            </span>
            <span>
              <strong>Clientes</strong> criam, modificam, consultam e cancelam pedidos.
            </span>
          </li>
          <li>
            <span className="icone-caixa" aria-hidden="true">
              <Icone nome="banco" />
            </span>
            <span>
              <strong>Agentes</strong> — empresas e bancos — analisam e emitem parecer.
            </span>
          </li>
          <li>
            <span className="icone-caixa" aria-hidden="true">
              <Icone nome="documento" />
            </span>
            <span>
              <strong>Contrato de crédito</strong> opcional, concedido por um banco agente.
            </span>
          </li>
        </ul>

        <div className="login-estrada" aria-hidden="true">
          <div className="faixa" />
        </div>
      </section>

      <section className="login-area" aria-label="Entrar">
        <form className="card login-form" onSubmit={enviar} noValidate>
          <div>
            <h2>Entrar</h2>
            <p className="dica" style={{ marginTop: 6 }}>
              Acesso restrito a usuários cadastrados.
            </p>
          </div>

          <Alerta tipo="sucesso">{aviso}</Alerta>
          <Alerta>{erro}</Alerta>

          <div className="segmentado" role="group" aria-label="Tipo de acesso">
            <button type="button" aria-pressed={tipo === 'cliente'} onClick={() => setTipo('cliente')}>
              Sou cliente
            </button>
            <button type="button" aria-pressed={tipo === 'agente'} onClick={() => setTipo('agente')}>
              Sou agente
            </button>
          </div>

          <Campo
            rotulo="Usuário"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="seu.usuario"
            autoComplete="username"
            required
          />
          <Campo
            rotulo="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <button type="submit" className="btn btn-primario btn-bloco" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'} <Icone nome="seta" tamanho={20} espessura={2.2} />
          </button>

          <div className="divisor-tracejado" aria-hidden="true" />
          <p className="centro">
            Ainda não tem cadastro? <Link to="/cadastro">Criar conta</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
