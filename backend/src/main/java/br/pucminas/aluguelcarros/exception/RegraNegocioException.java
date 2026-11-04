package br.pucminas.aluguelcarros.exception;

/** Violação de uma regra de negócio do domínio (ex.: mais de 3 rendimentos). */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
