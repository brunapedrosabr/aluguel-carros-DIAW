package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

/**
 * Usuário do sistema. Só pode usar o sistema após cadastro prévio e login.
 * Especializações: {@link Cliente} e {@link Agente} (empresas e bancos).
 */
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String login;

    /** Hash BCrypt da senha — a senha em texto puro nunca é armazenada. */
    @Column(nullable = false)
    private String senha;

    @Column(nullable = false, length = 120)
    private String nome;

    protected Usuario() {
    }

    protected Usuario(String login, String senhaCriptografada, String nome) {
        this.login = login;
        this.senha = senhaCriptografada;
        this.nome = nome;
    }

    public abstract Perfil getPerfil();

    /** Compara pela identidade persistida (ou pela instância, antes de salvar). */
    public boolean mesmoUsuario(Usuario outro) {
        if (outro == null) {
            return false;
        }
        if (this == outro) {
            return true;
        }
        return id != null && id.equals(outro.getId());
    }

    public void alterarSenha(String senhaCriptografada) {
        this.senha = senhaCriptografada;
    }

    protected void setLogin(String login) {
        this.login = login;
    }

    protected void setNome(String nome) {
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public String getSenha() {
        return senha;
    }

    public String getNome() {
        return nome;
    }
}
