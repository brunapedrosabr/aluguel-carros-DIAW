package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ParecerRequest(
        @NotNull(message = "Informe se o parecer é positivo ou negativo") Boolean positivo,
        @NotBlank(message = "Escreva a justificativa do parecer") @Size(max = 1000) String justificativa) {
}
