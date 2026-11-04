package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Rendimento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RendimentoDTO(
        @NotBlank(message = "Informe a entidade empregadora") @Size(max = 120) String entidadeEmpregadora,
        @NotNull(message = "Informe o valor") @Positive(message = "O valor deve ser maior que zero") BigDecimal valor) {

    public static RendimentoDTO from(Rendimento rendimento) {
        return new RendimentoDTO(rendimento.getEntidadeEmpregadora(), rendimento.getValor());
    }
}
