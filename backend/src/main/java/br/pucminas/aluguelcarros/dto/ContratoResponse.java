package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.ContratoCredito;
import br.pucminas.aluguelcarros.model.TipoProprietario;

import java.time.LocalDateTime;

public record ContratoResponse(
        Long id,
        LocalDateTime dataExecucao,
        TipoProprietario tipoProprietario,
        AgenteResumo agenteResponsavel,
        AgenteResumo bancoCredito,
        LocalDateTime dataConcessaoCredito) {

    public static ContratoResponse from(Contrato contrato) {
        if (contrato == null) {
            return null;
        }
        ContratoCredito credito = contrato.getContratoCredito();
        return new ContratoResponse(
                contrato.getId(),
                contrato.getDataExecucao(),
                contrato.getTipoProprietario(),
                AgenteResumo.from(contrato.getAgenteResponsavel()),
                credito == null ? null : AgenteResumo.from(credito.getBanco()),
                credito == null ? null : credito.getDataConcessao());
    }
}
