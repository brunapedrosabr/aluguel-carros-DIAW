// Endpoints do back-end, agrupados por recurso.
import { api } from './api.js'

export const authApi = {
  login: (login, senha) => api('/auth/login', { method: 'POST', body: { login, senha } }),
  registrar: (cliente) => api('/auth/registrar', { method: 'POST', body: cliente }),
}

export const clienteApi = {
  meuCadastro: () => api('/clientes/me'),
  atualizar: (cliente) => api('/clientes/me', { method: 'PUT', body: cliente }),
  excluir: () => api('/clientes/me', { method: 'DELETE' }),
}

export const pedidoApi = {
  listar: () => api('/pedidos'),
  buscar: (id) => api(`/pedidos/${id}`),
  criar: (pedido) => api('/pedidos', { method: 'POST', body: pedido }),
  modificar: (id, pedido) => api(`/pedidos/${id}`, { method: 'PUT', body: pedido }),
  cancelar: (id) => api(`/pedidos/${id}/cancelar`, { method: 'PATCH' }),
}

export const agenteApi = {
  listar: (status) => api(`/agente/pedidos${status ? `?status=${status}` : ''}`),
  modificar: (id, pedido) => api(`/agente/pedidos/${id}`, { method: 'PUT', body: pedido }),
  emitirParecer: (id, positivo, justificativa) =>
    api(`/agente/pedidos/${id}/parecer`, { method: 'POST', body: { positivo, justificativa } }),
  executarContrato: (id) => api(`/agente/pedidos/${id}/contrato`, { method: 'POST' }),
}

export const catalogoApi = {
  automoveis: () => api('/automoveis'),
  bancos: () => api('/bancos'),
}
