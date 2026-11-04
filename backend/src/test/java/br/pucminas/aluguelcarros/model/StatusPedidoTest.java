package br.pucminas.aluguelcarros.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StatusPedidoTest {

    @Test
    void somentePedidoEmAnalisePodeSerModificado() {
        for (StatusPedido status : StatusPedido.values()) {
            assertEquals(status == StatusPedido.EM_ANALISE, status.permiteModificacao(), status.name());
        }
    }

    @Test
    void cancelamentoPermitidoAteAExecucaoDoContrato() {
        assertTrue(StatusPedido.EM_ANALISE.permiteCancelamento());
        assertTrue(StatusPedido.APROVADO.permiteCancelamento());
        assertFalse(StatusPedido.CONTRATADO.permiteCancelamento());
        assertFalse(StatusPedido.REPROVADO.permiteCancelamento());
        assertFalse(StatusPedido.CANCELADO.permiteCancelamento());
    }

    @Test
    void pedidosAtivosReservamOVeiculo() {
        assertEquals(
                java.util.List.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO, StatusPedido.CONTRATADO),
                StatusPedido.queReservamVeiculo());
    }
}
