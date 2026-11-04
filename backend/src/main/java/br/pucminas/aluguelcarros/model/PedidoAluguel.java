package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

/**
 * Pedido de aluguel feito por um cliente. Após introduzido, é analisado do ponto de vista
 * financeiro por um agente; com parecer positivo, segue para a execução do contrato.
 */
@Entity
@Table(name = "pedidos")
public class PedidoAluguel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "automovel_id", nullable = false)
    private Automovel automovel;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPedido status;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_proprietario", nullable = false, length = 20)
    private TipoProprietario tipoProprietario;

    /** Banco escolhido para o contrato de crédito (opcional). */
    @ManyToOne
    @JoinColumn(name = "banco_credito_id")
    private Banco bancoCredito;

    @ManyToOne
    @JoinColumn(name = "agente_avaliador_id")
    private Agente agenteAvaliador;

    @Column(length = 1000)
    private String parecer;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "avaliado_em")
    private LocalDateTime avaliadoEm;

    @OneToOne(mappedBy = "pedido")
    private Contrato contrato;

    protected PedidoAluguel() {
    }

    public PedidoAluguel(Cliente cliente, Automovel automovel, LocalDate dataInicio, LocalDate dataFim,
                         TipoProprietario tipoProprietario, Banco bancoCredito) {
        this.cliente = Objects.requireNonNull(cliente, "cliente");
        definirDados(automovel, dataInicio, dataFim, tipoProprietario, bancoCredito);
        this.status = StatusPedido.EM_ANALISE;
        this.criadoEm = LocalDateTime.now();
    }

    // ---------------------------------------------------------------- regras

    public static void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new RegraNegocioException("Informe as datas de retirada e devolução.");
        }
        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("A data de devolução deve ser posterior à data de retirada.");
        }
    }

    public void garantirQuePodeSerModificado() {
        if (!status.permiteModificacao()) {
            throw new RegraNegocioException(
                    "Pedidos com status \"" + status.getDescricao() + "\" não podem mais ser modificados.");
        }
    }

    public void modificar(Automovel automovel, LocalDate dataInicio, LocalDate dataFim,
                          TipoProprietario tipoProprietario, Banco bancoCredito) {
        garantirQuePodeSerModificado();
        definirDados(automovel, dataInicio, dataFim, tipoProprietario, bancoCredito);
    }

    private void definirDados(Automovel automovel, LocalDate dataInicio, LocalDate dataFim,
                              TipoProprietario tipoProprietario, Banco bancoCredito) {
        if (automovel == null) {
            throw new RegraNegocioException("Selecione um automóvel.");
        }
        validarPeriodo(dataInicio, dataFim);
        if (tipoProprietario == null) {
            throw new RegraNegocioException("Informe em nome de quem o automóvel será registrado.");
        }
        if (tipoProprietario == TipoProprietario.BANCO && bancoCredito == null) {
            throw new RegraNegocioException("O registro em nome do banco exige um contrato de crédito.");
        }
        this.automovel = automovel;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.tipoProprietario = tipoProprietario;
        this.bancoCredito = bancoCredito;
    }

    public void cancelar() {
        if (!status.permiteCancelamento()) {
            throw new RegraNegocioException(
                    "Pedidos com status \"" + status.getDescricao() + "\" não podem ser cancelados.");
        }
        this.status = StatusPedido.CANCELADO;
    }

    /** Pedidos com crédito só ficam visíveis ao banco escolhido; os demais, a todos os agentes. */
    public boolean visivelPara(Agente agente) {
        return bancoCredito == null || bancoCredito.mesmoUsuario(agente);
    }

    public boolean podeSerAvaliadoPor(Agente agente) {
        return status == StatusPedido.EM_ANALISE && visivelPara(agente);
    }

    public void avaliar(Agente agente, boolean positivo, String justificativa) {
        if (status != StatusPedido.EM_ANALISE) {
            throw new RegraNegocioException("Somente pedidos em análise podem receber parecer.");
        }
        if (!visivelPara(agente)) {
            throw new RegraNegocioException(
                    "Pedidos com contrato de crédito só podem ser avaliados pelo banco escolhido.");
        }
        if (justificativa == null || justificativa.isBlank()) {
            throw new RegraNegocioException("Escreva a justificativa do parecer.");
        }
        this.agenteAvaliador = agente;
        this.parecer = justificativa.trim();
        this.avaliadoEm = LocalDateTime.now();
        this.status = positivo ? StatusPedido.APROVADO : StatusPedido.REPROVADO;
    }

    /** O contrato é executado pelo mesmo agente que emitiu o parecer positivo. */
    public boolean podeTerContratoExecutadoPor(Agente agente) {
        return status == StatusPedido.APROVADO && agenteAvaliador != null && agenteAvaliador.mesmoUsuario(agente);
    }

    /** Chamado por {@link Contrato#executar}. */
    void registrarContrato(Contrato contrato) {
        if (status != StatusPedido.APROVADO) {
            throw new RegraNegocioException("Só é possível executar o contrato de pedidos com parecer positivo.");
        }
        this.contrato = contrato;
        this.status = StatusPedido.CONTRATADO;
    }

    public boolean solicitaCredito() {
        return bancoCredito != null;
    }

    public long getQuantidadeDiarias() {
        return ChronoUnit.DAYS.between(dataInicio, dataFim);
    }

    // ---------------------------------------------------------------- getters

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Automovel getAutomovel() {
        return automovel;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public TipoProprietario getTipoProprietario() {
        return tipoProprietario;
    }

    public Banco getBancoCredito() {
        return bancoCredito;
    }

    public Agente getAgenteAvaliador() {
        return agenteAvaliador;
    }

    public String getParecer() {
        return parecer;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAvaliadoEm() {
        return avaliadoEm;
    }

    public Contrato getContrato() {
        return contrato;
    }
}
