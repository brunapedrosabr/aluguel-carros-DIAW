package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.PedidoAluguel;

/** Pedido do ponto de vista de um agente: inclui o contratante e as ações permitidas a ele. */
public record PedidoAgenteResponse(
        PedidoResponse pedido,
        ContratanteResponse contratante,
        boolean podeAvaliar,
        boolean podeExecutarContrato) {

    public static PedidoAgenteResponse from(PedidoAluguel pedido, Agente agente) {
        return new PedidoAgenteResponse(
                PedidoResponse.from(pedido),
                ContratanteResponse.from(pedido.getCliente()),
                pedido.podeSerAvaliadoPor(agente),
                pedido.podeTerContratoExecutadoPor(agente));
    }
}
