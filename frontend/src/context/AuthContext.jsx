import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  definirTokenMemoria,
  lerSessao,
  limparSessao,
  registrarAoExpirarSessao,
  salvarSessao,
} from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => lerSessao())

  const entrar = useCallback((novaSessao) => {
    salvarSessao(novaSessao)
    definirTokenMemoria(novaSessao.token)
    setSessao(novaSessao)
  }, [])

  const sair = useCallback(() => {
    limparSessao()
    definirTokenMemoria(null)
    setSessao(null)
  }, [])

  const atualizarUsuario = useCallback((dados) => {
    setSessao((atual) => {
      if (!atual) return atual
      const nova = { ...atual, usuario: { ...atual.usuario, ...dados } }
      salvarSessao(nova)
      return nova
    })
  }, [])

  useEffect(() => {
    if (sessao?.token) definirTokenMemoria(sessao.token)
    registrarAoExpirarSessao(sair)
  }, [sessao, sair])

  const valor = useMemo(
    () => ({ usuario: sessao?.usuario ?? null, entrar, sair, atualizarUsuario }),
    [sessao, entrar, sair, atualizarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function ehAgente(usuario) {
  return usuario?.perfil === 'EMPRESA' || usuario?.perfil === 'BANCO'
}

export function rotaInicial(usuario) {
  return ehAgente(usuario) ? '/agente' : '/cliente/pedidos'
}
