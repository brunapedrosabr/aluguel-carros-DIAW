package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/** Entidade empregadora e rendimento auferido por um cliente (máximo de 3 por cliente). */
@Entity
@Table(name = "rendimentos")
public class Rendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entidade_empregadora", nullable = false, length = 120)
    private String entidadeEmpregadora;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    protected Rendimento() {
    }

    /** Criado apenas por {@link Cliente#adicionarRendimento}, que controla o limite. */
    Rendimento(Cliente cliente, String entidadeEmpregadora, BigDecimal valor) {
        if (entidadeEmpregadora == null || entidadeEmpregadora.isBlank()) {
            throw new RegraNegocioException("Informe a entidade empregadora do rendimento.");
        }
        if (valor == null || valor.signum() <= 0) {
            throw new RegraNegocioException("O valor do rendimento deve ser maior que zero.");
        }
        this.cliente = cliente;
        this.entidadeEmpregadora = entidadeEmpregadora;
        this.valor = valor;
    }

    public Long getId() {
        return id;
    }

    public String getEntidadeEmpregadora() {
        return entidadeEmpregadora;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public Cliente getCliente() {
        return cliente;
    }
}
