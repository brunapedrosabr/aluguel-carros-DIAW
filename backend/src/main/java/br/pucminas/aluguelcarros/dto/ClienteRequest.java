package br.pucminas.aluguelcarros.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Dados de criação/atualização do cliente. A senha é obrigatória no cadastro
 * e opcional na atualização (em branco = mantém a atual).
 */
public record ClienteRequest(
        @NotBlank(message = "Informe o usuário") @Size(min = 3, max = 60, message = "O usuário deve ter entre 3 e 60 caracteres") String login,
        String senha,
        @NotBlank(message = "Informe o nome") @Size(max = 120) String nome,
        @NotBlank(message = "Informe o CPF") @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "CPF inválido") String cpf,
        @NotBlank(message = "Informe o RG") @Size(max = 20) String rg,
        @NotNull(message = "Informe o endereço") @Valid EnderecoDTO endereco,
        @NotBlank(message = "Informe a profissão") @Size(max = 80) String profissao,
        @Valid @Size(max = 3, message = "Informe no máximo 3 rendimentos") List<RendimentoDTO> rendimentos) {
}
