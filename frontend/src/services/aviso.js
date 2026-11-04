// Mensagem rápida ("flash") que sobrevive a um redirecionamento, ex.: "Seu cadastro foi excluído."
const CHAVE = 'rodar.aviso'
let memoria = null

export function definirAviso(mensagem) {
  memoria = mensagem
  try {
    sessionStorage.setItem(CHAVE, mensagem)
  } catch {
    // usa só a memória
  }
}

export function lerAviso() {
  try {
    return sessionStorage.getItem(CHAVE) ?? memoria
  } catch {
    return memoria
  }
}

export function limparAviso() {
  memoria = null
  try {
    sessionStorage.removeItem(CHAVE)
  } catch {
    // ignora
  }
}
