package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Cliente;

import java.math.BigDecimal;
import java.util.List;

public record ClienteResponse(
        Long id,
        String login,
        String nome,
        String cpf,
        String rg,
        EnderecoDTO endereco,
        String profissao,
        List<RendimentoDTO> rendimentos,
        BigDecimal rendaTotal) {

    public static ClienteResponse from(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getLogin(),
                cliente.getNome(),
                cliente.getCpf(),
                cliente.getRg(),
                EnderecoDTO.from(cliente.getEndereco()),
                cliente.getProfissao(),
                cliente.getRendimentos().stream().map(RendimentoDTO::from).toList(),
                cliente.getRendaTotal());
    }
}
