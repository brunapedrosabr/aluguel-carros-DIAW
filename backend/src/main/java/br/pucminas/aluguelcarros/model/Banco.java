package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Banco agente: além de avaliar pedidos, pode conceder contratos de crédito. */
@Entity
@Table(name = "bancos")
public class Banco extends Agente {

    protected Banco() {
    }

    public Banco(String login, String senhaCriptografada, String nome, String cnpj) {
        super(login, senhaCriptografada, nome, cnpj);
    }

    @Override
    public Perfil getPerfil() {
        return Perfil.BANCO;
    }
}
