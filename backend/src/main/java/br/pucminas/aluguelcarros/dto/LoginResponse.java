package br.pucminas.aluguelcarros.dto;

/** Token JWT a ser enviado no cabeçalho Authorization: Bearer &lt;token&gt;. */
public record LoginResponse(String token, UsuarioResponse usuario) {
}
