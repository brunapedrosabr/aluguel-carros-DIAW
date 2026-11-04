package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.model.TipoProprietario;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PedidoResponse(
        Long id,
        StatusPedido status,
        String statusDescricao,
        AutomovelResponse automovel,
        LocalDate dataInicio,
        LocalDate dataFim,
        long diarias,
        TipoProprietario tipoProprietario,
        AgenteResumo bancoCredito,
        AgenteResumo agenteAvaliador,
        String parecer,
        LocalDateTime criadoEm,
        LocalDateTime avaliadoEm,
        ContratoResponse contrato,
        boolean podeModificar,
        boolean podeCancelar) {

    public static PedidoResponse from(PedidoAluguel pedido) {
        StatusPedido status = pedido.getStatus();
        return new PedidoResponse(
                pedido.getId(),
                status,
                status.getDescricao(),
                AutomovelResponse.from(pedido.getAutomovel()),
                pedido.getDataInicio(),
                pedido.getDataFim(),
                pedido.getQuantidadeDiarias(),
                pedido.getTipoProprietario(),
                AgenteResumo.from(pedido.getBancoCredito()),
                AgenteResumo.from(pedido.getAgenteAvaliador()),
                pedido.getParecer(),
                pedido.getCriadoEm(),
                pedido.getAvaliadoEm(),
                ContratoResponse.from(pedido.getContrato()),
                status.permiteModificacao(),
                status.permiteCancelamento());
    }
}
