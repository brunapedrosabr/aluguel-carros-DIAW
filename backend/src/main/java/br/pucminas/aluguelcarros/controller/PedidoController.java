package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.dto.PedidoResponse;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Pedidos do cliente logado: introduzir, modificar, consultar e cancelar. */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return pedidoService.listarDoCliente(UsuarioAutenticado.id(jwt));
    }

    @GetMapping("/{id}")
    public PedidoResponse consultar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return pedidoService.buscarDoCliente(UsuarioAutenticado.id(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PedidoRequest request) {
        return pedidoService.criar(UsuarioAutenticado.id(jwt), request);
    }

    @PutMapping("/{id}")
    public PedidoResponse modificar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                    @Valid @RequestBody PedidoRequest request) {
        return pedidoService.modificarPeloCliente(UsuarioAutenticado.id(jwt), id, request);
    }

    @PatchMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return pedidoService.cancelar(UsuarioAutenticado.id(jwt), id);
    }
}
