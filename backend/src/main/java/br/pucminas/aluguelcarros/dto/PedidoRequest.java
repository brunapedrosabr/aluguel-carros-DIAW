package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.TipoProprietario;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** {@code bancoCreditoId} nulo = aluguel sem contrato de crédito. */
public record PedidoRequest(
        @NotNull(message = "Selecione um automóvel") Long automovelId,
        @NotNull(message = "Informe a data de retirada") LocalDate dataInicio,
        @NotNull(message = "Informe a data de devolução") LocalDate dataFim,
        @NotNull(message = "Informe em nome de quem o automóvel será registrado") TipoProprietario tipoProprietario,
        Long bancoCreditoId) {
}
