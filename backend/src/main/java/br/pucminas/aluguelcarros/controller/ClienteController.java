package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.ClienteRequest;
import br.pucminas.aluguelcarros.dto.ClienteResponse;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** CRUD do próprio cadastro do cliente logado (o "create" é o /api/auth/registrar). */
@RestController
@RequestMapping("/api/clientes/me")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ClienteResponse consultar(@AuthenticationPrincipal Jwt jwt) {
        return clienteService.buscar(UsuarioAutenticado.id(jwt));
    }

    @PutMapping
    public ClienteResponse atualizar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ClienteRequest request) {
        return clienteService.atualizar(UsuarioAutenticado.id(jwt), request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt) {
        clienteService.excluir(UsuarioAutenticado.id(jwt));
    }
}
