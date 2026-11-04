import { Navigate } from 'react-router-dom'
import { ehAgente, useAuth } from '../context/AuthContext.jsx'

/** Só deixa passar usuários logados com o perfil esperado ("CLIENTE" ou "AGENTE"). */
export default function RotaProtegida({ perfil, children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (perfil === 'CLIENTE' && usuario.perfil !== 'CLIENTE') return <Navigate to="/agente" replace />
  if (perfil === 'AGENTE' && !ehAgente(usuario)) return <Navigate to="/cliente/pedidos" replace />
  return children
}
