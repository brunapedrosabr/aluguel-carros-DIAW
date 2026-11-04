import { NavLink, useNavigate } from 'react-router-dom'
import { ehAgente, useAuth } from '../context/AuthContext.jsx'
import { iniciais, ROTULO_PERFIL } from '../utils/formatos.js'
import Icone from './Icone.jsx'
import Logo from './Logo.jsx'

const LINKS_CLIENTE = [
  { para: '/cliente/pedidos', rotulo: 'Meus pedidos', exato: true },
  { para: '/cliente/pedidos/novo', rotulo: 'Novo pedido', exato: true },
  { para: '/cliente/cadastro', rotulo: 'Meu cadastro', exato: true },
]

const LINKS_AGENTE = [{ para: '/agente', rotulo: 'Fila de análise', exato: true }]

export default function Navbar() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const agente = ehAgente(usuario)
  const links = agente ? LINKS_AGENTE : LINKS_CLIENTE

  function aoSair() {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topo">
      <nav className="topo-interno" aria-label="Principal">
        <Logo para={agente ? '/agente' : '/cliente/pedidos'} />
        <div className="nav-links">
          {links.map((link) => (
            <NavLink key={link.para} to={link.para} end={link.exato} className="nav-link">
              {link.rotulo}
            </NavLink>
          ))}
        </div>
        <div className="usuario-area">
          <span className={`avatar${agente ? ' agente' : ''}`} aria-hidden="true">
            {agente ? <Icone nome="banco" /> : iniciais(usuario?.nome)}
          </span>
          <span className="usuario-nome">
            <strong>{usuario?.nome}</strong>
            <span>{ROTULO_PERFIL[usuario?.perfil]}</span>
          </span>
          <button type="button" className="btn-sair" onClick={aoSair} aria-label="Sair">
            <Icone nome="sair" />
          </button>
        </div>
      </nav>
    </header>
  )
}
