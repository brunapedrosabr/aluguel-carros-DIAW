package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Agente aderente ao sistema (empresa ou banco): modifica e avalia pedidos. */
@Entity
@Table(name = "agentes")
public abstract class Agente extends Usuario {

    @Column(nullable = false, unique = true, length = 18)
    private String cnpj;

    protected Agente() {
    }

    protected Agente(String login, String senhaCriptografada, String nome, String cnpj) {
        super(login, senhaCriptografada, nome);
        this.cnpj = cnpj;
    }

    public String getCnpj() {
        return cnpj;
    }
}
