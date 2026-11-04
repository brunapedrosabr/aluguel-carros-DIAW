// Formatação no padrão brasileiro. Datas da API chegam como "AAAA-MM-DD" (LocalDate).

export function formatarData(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDataCurta(iso) {
  if (!iso) return '—'
  const [, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}`
}

export function formatarPeriodo(inicio, fim) {
  return `${formatarDataCurta(inicio)} – ${formatarData(fim)}`
}

export function formatarDataHora(iso) {
  if (!iso) return '—'
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return formatarData(iso)
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor) {
  return moeda.format(Number(valor ?? 0))
}

export function formatarValorEditavel(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Converte "6.200,50" ou "6200.5" em número. Retorna null se não for um valor válido. */
export function lerValor(texto) {
  if (texto === null || texto === undefined) return null
  let limpo = String(texto).trim().replace(/[R$\s]/g, '')
  if (!limpo) return null
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.')
  const numero = Number(limpo)
  return Number.isFinite(numero) ? numero : null
}

export function contarDiarias(inicio, fim) {
  if (!inicio || !fim) return 0
  const dias = (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86_400_000
  return dias > 0 ? Math.round(dias) : 0
}

export function hojeISO() {
  const agora = new Date()
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function numeroPedido(id) {
  return `#${String(id).padStart(4, '0')}`
}

export function iniciais(nome) {
  if (!nome) return '?'
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

export function plural(n, singular, pluralTexto) {
  return `${n} ${n === 1 ? singular : pluralTexto}`
}

export const ROTULO_PROPRIETARIO = {
  CLIENTE: 'Em nome do cliente',
  EMPRESA: 'Em nome da empresa',
  BANCO: 'Em nome do banco',
}

export const ROTULO_PERFIL = {
  CLIENTE: 'Cliente',
  EMPRESA: 'Agente · empresa',
  BANCO: 'Agente · banco',
}
