package br.pucminas.aluguelcarros.model;

import java.util.List;

/** Perfil de acesso de um usuário. Agentes (empresas e bancos) compartilham o papel AGENTE. */
public enum Perfil {

    CLIENTE("Cliente", List.of("CLIENTE")),
    EMPRESA("Empresa", List.of("AGENTE", "EMPRESA")),
    BANCO("Banco", List.of("AGENTE", "BANCO"));

    private final String descricao;
    private final List<String> papeis;

    Perfil(String descricao, List<String> papeis) {
        this.descricao = descricao;
        this.papeis = papeis;
    }

    public String getDescricao() {
        return descricao;
    }

    /** Papéis usados pelo Spring Security (viram ROLE_CLIENTE, ROLE_AGENTE...). */
    public List<String> getPapeis() {
        return papeis;
    }

    public boolean isAgente() {
        return papeis.contains("AGENTE");
    }
}
