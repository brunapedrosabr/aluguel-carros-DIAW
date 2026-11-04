// Cliente HTTP da aplicação: envia o token JWT e padroniza os erros da API.

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const CHAVE_SESSAO = 'rodar.sessao'

export class ApiError extends Error {
  constructor(status, mensagem, campos = {}) {
    super(mensagem)
    this.status = status
    this.campos = campos
  }
}

export function lerSessao() {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO))
    if (!sessao?.token || tokenExpirado(sessao.token)) return null
    return sessao
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  } catch {
    // armazenamento indisponível (modo privado): a sessão dura só enquanto a aba estiver aberta
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    // ignora
  }
}

function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

let aoExpirarSessao = null

/** Registrado pelo AuthContext: chamado quando o back-end recusa o token (401). */
export function registrarAoExpirarSessao(callback) {
  aoExpirarSessao = callback
}

let tokenMemoria = null

export function definirTokenMemoria(token) {
  tokenMemoria = token
}

function mensagemPadrao(status) {
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Registro não encontrado.'
  return 'Algo deu errado. Tente novamente.'
}

export async function api(caminho, { method = 'GET', body } = {}) {
  const token = lerSessao()?.token ?? tokenMemoria
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(`${BASE_URL}/api${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.')
  }

  if (resposta.status === 204) return null

  let dados = null
  const texto = await resposta.text()
  if (texto) {
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && token && aoExpirarSessao) aoExpirarSessao()
    throw new ApiError(resposta.status, dados?.mensagem ?? mensagemPadrao(resposta.status), dados?.campos ?? {})
  }
  return dados
}
