package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PedidoAluguelRepository extends JpaRepository<PedidoAluguel, Long> {

    List<PedidoAluguel> findByClienteIdOrderByCriadoEmDesc(Long clienteId);

    Optional<PedidoAluguel> findByIdAndClienteId(Long id, Long clienteId);

    List<PedidoAluguel> findByStatusOrderByCriadoEmAsc(StatusPedido status);

    List<PedidoAluguel> findAllByOrderByCriadoEmDesc();

    boolean existsByClienteIdAndStatusIn(Long clienteId, Collection<StatusPedido> status);

    /**
     * Conta pedidos que reservam o mesmo automóvel em período sobreposto.
     * {@code ignorarId} exclui o próprio pedido numa modificação (use -1 ao criar).
     */
    @Query("""
            select count(p) from PedidoAluguel p
            where p.automovel.id = :automovelId
              and p.status in :status
              and p.dataInicio < :fim
              and p.dataFim > :inicio
              and p.id <> :ignorarId
            """)
    long contarConflitos(@Param("automovelId") Long automovelId,
                         @Param("inicio") LocalDate inicio,
                         @Param("fim") LocalDate fim,
                         @Param("status") Collection<StatusPedido> status,
                         @Param("ignorarId") Long ignorarId);
}
