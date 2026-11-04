package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.ParecerRequest;
import br.pucminas.aluguelcarros.dto.PedidoAgenteResponse;
import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Área dos agentes (empresas e bancos): modificar, avaliar e executar contratos. */
@RestController
@RequestMapping("/api/agente/pedidos")
public class AgentePedidoController {

    private final PedidoService pedidoService;

    public AgentePedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<PedidoAgenteResponse> listar(@AuthenticationPrincipal Jwt jwt,
                                             @RequestParam(required = false) StatusPedido status) {
        return pedidoService.listarParaAgente(UsuarioAutenticado.id(jwt), status);
    }

    @GetMapping("/{id}")
    public PedidoAgenteResponse consultar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return pedidoService.buscarParaAgente(UsuarioAutenticado.id(jwt), id);
    }

    @PutMapping("/{id}")
    public PedidoAgenteResponse modificar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                          @Valid @RequestBody PedidoRequest request) {
        return pedidoService.modificarPeloAgente(UsuarioAutenticado.id(jwt), id, request);
    }

    @PostMapping("/{id}/parecer")
    public PedidoAgenteResponse avaliar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                        @Valid @RequestBody ParecerRequest request) {
        return pedidoService.avaliar(UsuarioAutenticado.id(jwt), id, request);
    }

    @PostMapping("/{id}/contrato")
    public PedidoAgenteResponse executarContrato(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return pedidoService.executarContrato(UsuarioAutenticado.id(jwt), id);
    }
}
