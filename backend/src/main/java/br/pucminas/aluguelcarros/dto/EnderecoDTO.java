package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Endereco;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoDTO(
        @NotBlank(message = "Informe o logradouro e o número") @Size(max = 150) String logradouro,
        @Size(max = 80) String bairro,
        @NotBlank(message = "Informe a cidade") @Size(max = 80) String cidade,
        @NotBlank(message = "Informe a UF") @Size(min = 2, max = 2, message = "A UF deve ter 2 letras") String uf,
        @Size(max = 9, message = "CEP inválido") String cep) {

    public static EnderecoDTO from(Endereco endereco) {
        if (endereco == null) {
            return null;
        }
        return new EnderecoDTO(endereco.getLogradouro(), endereco.getBairro(), endereco.getCidade(),
                endereco.getUf(), endereco.getCep());
    }

    public Endereco toModel() {
        return new Endereco(
                logradouro.trim(),
                bairro == null ? null : bairro.trim(),
                cidade.trim(),
                uf.trim().toUpperCase(),
                cep == null ? null : cep.trim());
    }
}
