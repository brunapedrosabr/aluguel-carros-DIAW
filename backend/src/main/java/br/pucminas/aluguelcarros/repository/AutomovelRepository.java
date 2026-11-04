package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Automovel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutomovelRepository extends JpaRepository<Automovel, Long> {

    List<Automovel> findAllByOrderByMarcaAscModeloAsc();

    Optional<Automovel> findByPlaca(String placa);
}
