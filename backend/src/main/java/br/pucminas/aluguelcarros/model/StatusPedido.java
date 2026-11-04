package br.pucminas.aluguelcarros.model;

import java.util.Arrays;
import java.util.List;

/**
 * Ciclo de vida de um pedido de aluguel:
 * EM_ANALISE → (parecer do agente) → APROVADO | REPROVADO → (execução do contrato) → CONTRATADO.
 * Enquanto não há contrato, o cliente pode cancelar.
 */
public enum StatusPedido {

    EM_ANALISE("Em análise", true, true, true),
    APROVADO("Parecer positivo", false, true, true),
    REPROVADO("Parecer negativo", false, false, false),
    CONTRATADO("Contrato executado", false, false, true),
    CANCELADO("Cancelado", false, false, false);

    private final String descricao;
    private final boolean permiteModificacao;
    private final boolean permiteCancelamento;
    private final boolean reservaVeiculo;

    StatusPedido(String descricao, boolean permiteModificacao, boolean permiteCancelamento, boolean reservaVeiculo) {
        this.descricao = descricao;
        this.permiteModificacao = permiteModificacao;
        this.permiteCancelamento = permiteCancelamento;
        this.reservaVeiculo = reservaVeiculo;
    }

    public String getDescricao() {
        return descricao;
    }

    public boolean permiteModificacao() {
        return permiteModificacao;
    }

    public boolean permiteCancelamento() {
        return permiteCancelamento;
    }

    /** Pedidos nesses status ocupam o automóvel no período e impedem novos pedidos conflitantes. */
    public boolean reservaVeiculo() {
        return reservaVeiculo;
    }

    public static List<StatusPedido> queReservamVeiculo() {
        return Arrays.stream(values()).filter(StatusPedido::reservaVeiculo).toList();
    }
}
