package br.pucminas.aluguelcarros.dto;

import java.time.LocalDateTime;
import java.util.Map;

/** Corpo padrão das respostas de erro da API. {@code campos} traz erros de validação por campo. */
public record ErroResponse(int status, String mensagem, Map<String, String> campos, LocalDateTime timestamp) {

    public static ErroResponse of(int status, String mensagem) {
        return new ErroResponse(status, mensagem, Map.of(), LocalDateTime.now());
    }
}
