package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Banco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BancoRepository extends JpaRepository<Banco, Long> {

    List<Banco> findAllByOrderByNomeAsc();

    Optional<Banco> findByLogin(String login);
}
