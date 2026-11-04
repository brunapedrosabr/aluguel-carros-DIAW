package br.pucminas.aluguelcarros.model;

/** Em nome de quem o automóvel alugado é registrado, conforme o tipo de contrato. */
public enum TipoProprietario {

    CLIENTE("Cliente"),
    EMPRESA("Empresa"),
    BANCO("Banco");

    private final String descricao;

    TipoProprietario(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
