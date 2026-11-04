package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Contrato de aluguel executado a partir de um pedido com parecer positivo.
 * Pode estar associado a um {@link ContratoCredito} concedido por um banco agente.
 */
@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private PedidoAluguel pedido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agente_responsavel_id", nullable = false)
    private Agente agenteResponsavel;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_proprietario", nullable = false, length = 20)
    private TipoProprietario tipoProprietario;

    @Column(name = "data_execucao", nullable = false)
    private LocalDateTime dataExecucao;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "contrato_credito_id")
    private ContratoCredito contratoCredito;

    protected Contrato() {
    }

    private Contrato(PedidoAluguel pedido, Agente agenteResponsavel) {
        this.pedido = pedido;
        this.agenteResponsavel = agenteResponsavel;
        this.tipoProprietario = pedido.getTipoProprietario();
        this.dataExecucao = LocalDateTime.now();
    }

    /** Executa o contrato do pedido. Se o pedido pediu crédito, gera o contrato de crédito com o banco. */
    public static Contrato executar(PedidoAluguel pedido, Agente agente) {
        if (pedido.getStatus() != StatusPedido.APROVADO) {
            throw new RegraNegocioException("Só é possível executar o contrato de pedidos com parecer positivo.");
        }
        if (!pedido.podeTerContratoExecutadoPor(agente)) {
            throw new RegraNegocioException("O contrato deve ser executado pelo agente que emitiu o parecer.");
        }
        Contrato contrato = new Contrato(pedido, agente);
        if (pedido.solicitaCredito()) {
            contrato.contratoCredito = new ContratoCredito(pedido.getBancoCredito());
        }
        pedido.registrarContrato(contrato);
        return contrato;
    }

    public Long getId() {
        return id;
    }

    public PedidoAluguel getPedido() {
        return pedido;
    }

    public Agente getAgenteResponsavel() {
        return agenteResponsavel;
    }

    public TipoProprietario getTipoProprietario() {
        return tipoProprietario;
    }

    public LocalDateTime getDataExecucao() {
        return dataExecucao;
    }

    public ContratoCredito getContratoCredito() {
        return contratoCredito;
    }
}
