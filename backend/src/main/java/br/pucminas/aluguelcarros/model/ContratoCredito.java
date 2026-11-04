package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

/** Contrato de crédito concedido por um banco agente e associado a um aluguel. */
@Entity
@Table(name = "contratos_credito")
public class ContratoCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @Column(name = "data_concessao", nullable = false)
    private LocalDateTime dataConcessao;

    protected ContratoCredito() {
    }

    ContratoCredito(Banco banco) {
        this.banco = Objects.requireNonNull(banco, "banco");
        this.dataConcessao = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Banco getBanco() {
        return banco;
    }

    public LocalDateTime getDataConcessao() {
        return dataConcessao;
    }
}
