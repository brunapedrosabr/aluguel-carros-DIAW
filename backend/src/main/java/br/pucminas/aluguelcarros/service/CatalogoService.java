package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.AgenteResumo;
import br.pucminas.aluguelcarros.dto.AutomovelResponse;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.BancoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Dados de apoio para montar os formulários: automóveis e bancos agentes. */
@Service
public class CatalogoService {

    private final AutomovelRepository automovelRepository;
    private final BancoRepository bancoRepository;

    public CatalogoService(AutomovelRepository automovelRepository, BancoRepository bancoRepository) {
        this.automovelRepository = automovelRepository;
        this.bancoRepository = bancoRepository;
    }

    @Transactional(readOnly = true)
    public List<AutomovelResponse> listarAutomoveis() {
        return automovelRepository.findAllByOrderByMarcaAscModeloAsc().stream()
                .map(AutomovelResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgenteResumo> listarBancos() {
        return bancoRepository.findAllByOrderByNomeAsc().stream()
                .map(AgenteResumo::from)
                .toList();
    }
}
