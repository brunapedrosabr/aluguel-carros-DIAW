package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.ClienteRequest;
import br.pucminas.aluguelcarros.dto.LoginRequest;
import br.pucminas.aluguelcarros.dto.LoginResponse;
import br.pucminas.aluguelcarros.service.AuthService;
import br.pucminas.aluguelcarros.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Rotas públicas: login e cadastro prévio do cliente. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ClienteService clienteService;

    public AuthController(AuthService authService, ClienteService clienteService) {
        this.authService = authService;
        this.clienteService = clienteService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.autenticar(request);
    }

    /** Cadastra o cliente e já devolve o token de acesso. */
    @PostMapping("/registrar")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse registrar(@Valid @RequestBody ClienteRequest request) {
        clienteService.cadastrar(request);
        return authService.autenticar(new LoginRequest(request.login(), request.senha()));
    }
}
