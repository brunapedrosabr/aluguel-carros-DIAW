import { Navigate, Route, Routes } from 'react-router-dom'
import RotaProtegida from './components/RotaProtegida.jsx'
import { rotaInicial, useAuth } from './context/AuthContext.jsx'
import AgentePainel from './pages/AgentePainel.jsx'
import CriarConta from './pages/CriarConta.jsx'
import FormPedido from './pages/FormPedido.jsx'
import Login from './pages/Login.jsx'
import MeuCadastro from './pages/MeuCadastro.jsx'
import MeusPedidos from './pages/MeusPedidos.jsx'

function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={usuario ? rotaInicial(usuario) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<CriarConta />} />

      <Route
        path="/cliente/pedidos"
        element={
          <RotaProtegida perfil="CLIENTE">
            <MeusPedidos />
          </RotaProtegida>
        }
      />
      <Route
        path="/cliente/pedidos/novo"
        element={
          <RotaProtegida perfil="CLIENTE">
            <FormPedido />
          </RotaProtegida>
        }
      />
      <Route
        path="/cliente/pedidos/:id/editar"
        element={
          <RotaProtegida perfil="CLIENTE">
            <FormPedido />
          </RotaProtegida>
        }
      />
      <Route
        path="/cliente/cadastro"
        element={
          <RotaProtegida perfil="CLIENTE">
            <MeuCadastro />
          </RotaProtegida>
        }
      />

      <Route
        path="/agente"
        element={
          <RotaProtegida perfil="AGENTE">
            <AgentePainel />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<Inicio />} />
    </Routes>
  )
}
