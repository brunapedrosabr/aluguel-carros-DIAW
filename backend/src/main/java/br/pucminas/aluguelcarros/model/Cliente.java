package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Contratante do aluguel. Guarda dados de identificação (RG, CPF, nome, endereço),
 * profissão e até {@value #MAX_RENDIMENTOS} entidades empregadoras com seus rendimentos.
 */
@Entity
@Table(name = "clientes")
public class Cliente extends Usuario {

    public static final int MAX_RENDIMENTOS = 3;

    @Column(nullable = false, length = 20)
    private String rg;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Embedded
    private Endereco endereco;

    @Column(length = 80)
    private String profissao;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<Rendimento> rendimentos = new ArrayList<>();

    protected Cliente() {
    }

    public Cliente(String login, String senhaCriptografada, String nome, String rg, String cpf,
                   Endereco endereco, String profissao) {
        super(login, senhaCriptografada, nome);
        this.rg = rg;
        this.cpf = cpf;
        this.endereco = endereco;
        this.profissao = profissao;
    }

    @Override
    public Perfil getPerfil() {
        return Perfil.CLIENTE;
    }

    public void atualizarDados(String login, String nome, String rg, String cpf, Endereco endereco, String profissao) {
        setLogin(login);
        setNome(nome);
        this.rg = rg;
        this.cpf = cpf;
        this.endereco = endereco;
        this.profissao = profissao;
    }

    public void adicionarRendimento(String entidadeEmpregadora, BigDecimal valor) {
        if (rendimentos.size() >= MAX_RENDIMENTOS) {
            throw new RegraNegocioException(
                    "Um cliente pode informar no máximo " + MAX_RENDIMENTOS + " rendimentos.");
        }
        rendimentos.add(new Rendimento(this, entidadeEmpregadora, valor));
    }

    public void limparRendimentos() {
        rendimentos.clear();
    }

    public BigDecimal getRendaTotal() {
        return rendimentos.stream()
                .map(Rendimento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Rendimento> getRendimentos() {
        return Collections.unmodifiableList(rendimentos);
    }

    public String getRg() {
        return rg;
    }

    public String getCpf() {
        return cpf;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public String getProfissao() {
        return profissao;
    }
}
