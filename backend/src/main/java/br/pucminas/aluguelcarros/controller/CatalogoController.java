package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.AgenteResumo;
import br.pucminas.aluguelcarros.dto.AutomovelResponse;
import br.pucminas.aluguelcarros.service.CatalogoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Listas de apoio para qualquer usuário autenticado. */
@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/automoveis")
    public List<AutomovelResponse> automoveis() {
        return catalogoService.listarAutomoveis();
    }

    @GetMapping("/bancos")
    public List<AgenteResumo> bancos() {
        return catalogoService.listarBancos();
    }
}
