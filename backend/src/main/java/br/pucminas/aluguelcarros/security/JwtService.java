package br.pucminas.aluguelcarros.security;

import br.pucminas.aluguelcarros.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/** Gera o token JWT entregue no login. O "subject" do token é o id do usuário. */
@Service
public class JwtService {

    public static final String CLAIM_PAPEIS = "roles";
    private static final String EMISSOR = "aluguel-carros";

    private final JwtEncoder jwtEncoder;
    private final long expiracaoHoras;

    public JwtService(JwtEncoder jwtEncoder, @Value("${app.jwt.expiracao-horas:8}") long expiracaoHoras) {
        this.jwtEncoder = jwtEncoder;
        this.expiracaoHoras = expiracaoHoras;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(EMISSOR)
                .issuedAt(agora)
                .expiresAt(agora.plus(expiracaoHoras, ChronoUnit.HOURS))
                .subject(String.valueOf(usuario.getId()))
                .claim("login", usuario.getLogin())
                .claim("nome", usuario.getNome())
                .claim("perfil", usuario.getPerfil().name())
                .claim(CLAIM_PAPEIS, usuario.getPerfil().getPapeis())
                .build();
        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
    }
}
