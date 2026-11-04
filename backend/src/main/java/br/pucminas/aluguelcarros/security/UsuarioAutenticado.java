package br.pucminas.aluguelcarros.security;

import org.springframework.security.oauth2.jwt.Jwt;

/** Lê do token JWT o id do usuário logado. */
public final class UsuarioAutenticado {

    private UsuarioAutenticado() {
    }

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
