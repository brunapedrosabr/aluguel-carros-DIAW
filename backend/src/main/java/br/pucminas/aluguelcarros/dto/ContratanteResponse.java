package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Cliente;

import java.math.BigDecimal;
import java.util.List;

/** Visão do contratante para o agente: documentos parcialmente mascarados. */
public record ContratanteResponse(
        Long id,
        String nome,
        String profissao,
        String cpf,
        String rg,
        EnderecoDTO endereco,
        List<RendimentoDTO> rendimentos,
        BigDecimal rendaTotal) {

    public static ContratanteResponse from(Cliente cliente) {
        return new ContratanteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getProfissao(),
                mascararCpf(cliente.getCpf()),
                mascararRg(cliente.getRg()),
                EnderecoDTO.from(cliente.getEndereco()),
                cliente.getRendimentos().stream().map(RendimentoDTO::from).toList(),
                cliente.getRendaTotal());
    }

    /** 123.456.789-09 → ***.456.789-** */
    static String mascararCpf(String cpf) {
        String digitos = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (digitos.length() != 11) {
            return "***";
        }
        return "***." + digitos.substring(3, 6) + "." + digitos.substring(6, 9) + "-**";
    }

    /** Mantém visíveis apenas os 3 últimos caracteres alfanuméricos. */
    static String mascararRg(String rg) {
        if (rg == null || rg.isBlank()) {
            return "***";
        }
        char[] chars = rg.toCharArray();
        int visiveis = 0;
        for (int i = chars.length - 1; i >= 0; i--) {
            if (Character.isLetterOrDigit(chars[i])) {
                if (visiveis < 3) {
                    visiveis++;
                } else {
                    chars[i] = '*';
                }
            }
        }
        return new String(chars);
    }
}
