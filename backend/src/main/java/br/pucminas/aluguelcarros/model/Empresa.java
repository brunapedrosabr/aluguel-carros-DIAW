package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresas")
public class Empresa extends Agente {

    protected Empresa() {
    }

    public Empresa(String login, String senhaCriptografada, String nome, String cnpj) {
        super(login, senhaCriptografada, nome, cnpj);
    }

    @Override
    public Perfil getPerfil() {
        return Perfil.EMPRESA;
    }
}
