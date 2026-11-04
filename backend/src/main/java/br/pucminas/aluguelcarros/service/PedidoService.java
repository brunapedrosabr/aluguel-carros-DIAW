package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.ParecerRequest;
import br.pucminas.aluguelcarros.dto.PedidoAgenteResponse;
import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.dto.PedidoResponse;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.AgenteRepository;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.BancoRepository;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Subsistema de gestão de pedidos e contratos.
 * Clientes introduzem, modificam, consultam e cancelam pedidos;
 * agentes modificam, avaliam e executam o contrato dos pedidos aprovados.
 */
@Service
public class PedidoService {

    private static final String PEDIDO_NAO_ENCONTRADO = "Pedido não encontrado.";

    private final PedidoAluguelRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;
    private final AutomovelRepository automovelRepository;
    private final BancoRepository bancoRepository;
    private final ContratoRepository contratoRepository;

    public PedidoService(PedidoAluguelRepository pedidoRepository, ClienteRepository clienteRepository,
                         AgenteRepository agenteRepository, AutomovelRepository automovelRepository,
                         BancoRepository bancoRepository, ContratoRepository contratoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.agenteRepository = agenteRepository;
        this.automovelRepository = automovelRepository;
        this.bancoRepository = bancoRepository;
        this.contratoRepository = contratoRepository;
    }

    // ================================================================ cliente

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarDoCliente(Long clienteId) {
        return pedidoRepository.findByClienteIdOrderByCriadoEmDesc(clienteId).stream()
                .map(PedidoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarDoCliente(Long clienteId, Long pedidoId) {
        return PedidoResponse.from(obterDoCliente(clienteId, pedidoId));
    }

    @Transactional
    public PedidoResponse criar(Long clienteId, PedidoRequest request) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
        PedidoAluguel.validarPeriodo(request.dataInicio(), request.dataFim());
        validarDataRetirada(request.dataInicio());
        Automovel automovel = obterAutomovel(request.automovelId());
        Banco banco = obterBanco(request.bancoCreditoId());
        verificarDisponibilidade(automovel, request.dataInicio(), request.dataFim(), null);

        PedidoAluguel pedido = new PedidoAluguel(cliente, automovel, request.dataInicio(), request.dataFim(),
                request.tipoProprietario(), banco);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse modificarPeloCliente(Long clienteId, Long pedidoId, PedidoRequest request) {
        PedidoAluguel pedido = obterDoCliente(clienteId, pedidoId);
        aplicarModificacao(pedido, request);
        return PedidoResponse.from(pedido);
    }

    @Transactional
    public PedidoResponse cancelar(Long clienteId, Long pedidoId) {
        PedidoAluguel pedido = obterDoCliente(clienteId, pedidoId);
        pedido.cancelar();
        return PedidoResponse.from(pedido);
    }

    // ================================================================ agente

    /** {@code status} nulo = todos os pedidos visíveis ao agente. */
    @Transactional(readOnly = true)
    public List<PedidoAgenteResponse> listarParaAgente(Long agenteId, StatusPedido status) {
        Agente agente = obterAgente(agenteId);
        List<PedidoAluguel> pedidos = status == null
                ? pedidoRepository.findAllByOrderByCriadoEmDesc()
                : pedidoRepository.findByStatusOrderByCriadoEmAsc(status);
        return pedidos.stream()
                .filter(pedido -> pedido.visivelPara(agente))
                .map(pedido -> PedidoAgenteResponse.from(pedido, agente))
                .toList();
    }

    @Transactional(readOnly = true)
    public PedidoAgenteResponse buscarParaAgente(Long agenteId, Long pedidoId) {
        Agente agente = obterAgente(agenteId);
        return PedidoAgenteResponse.from(obterVisivel(agente, pedidoId), agente);
    }

    @Transactional
    public PedidoAgenteResponse modificarPeloAgente(Long agenteId, Long pedidoId, PedidoRequest request) {
        Agente agente = obterAgente(agenteId);
        PedidoAluguel pedido = obterVisivel(agente, pedidoId);
        aplicarModificacao(pedido, request);
        return PedidoAgenteResponse.from(pedido, agente);
    }

    @Transactional
    public PedidoAgenteResponse avaliar(Long agenteId, Long pedidoId, ParecerRequest request) {
        Agente agente = obterAgente(agenteId);
        PedidoAluguel pedido = obterVisivel(agente, pedidoId);
        pedido.avaliar(agente, request.positivo(), request.justificativa());
        return PedidoAgenteResponse.from(pedido, agente);
    }

    @Transactional
    public PedidoAgenteResponse executarContrato(Long agenteId, Long pedidoId) {
        Agente agente = obterAgente(agenteId);
        PedidoAluguel pedido = obterVisivel(agente, pedidoId);
        Contrato contrato = Contrato.executar(pedido, agente);
        contratoRepository.save(contrato);
        return PedidoAgenteResponse.from(pedido, agente);
    }

    // ================================================================ apoio

    private void aplicarModificacao(PedidoAluguel pedido, PedidoRequest request) {
        pedido.garantirQuePodeSerModificado();
        PedidoAluguel.validarPeriodo(request.dataInicio(), request.dataFim());
        validarDataRetirada(request.dataInicio());
        Automovel automovel = obterAutomovel(request.automovelId());
        Banco banco = obterBanco(request.bancoCreditoId());
        verificarDisponibilidade(automovel, request.dataInicio(), request.dataFim(), pedido.getId());
        pedido.modificar(automovel, request.dataInicio(), request.dataFim(), request.tipoProprietario(), banco);
    }

    private void validarDataRetirada(LocalDate dataInicio) {
        if (dataInicio.isBefore(LocalDate.now())) {
            throw new RegraNegocioException("A data de retirada não pode estar no passado.");
        }
    }

    private void verificarDisponibilidade(Automovel automovel, LocalDate inicio, LocalDate fim, Long pedidoIgnorado) {
        long conflitos = pedidoRepository.contarConflitos(
                automovel.getId(), inicio, fim, StatusPedido.queReservamVeiculo(),
                pedidoIgnorado == null ? -1L : pedidoIgnorado);
        if (conflitos > 0) {
            throw new RegraNegocioException(
                    "Este automóvel já está reservado nesse período. Escolha outras datas ou outro veículo.");
        }
    }

    private PedidoAluguel obterDoCliente(Long clienteId, Long pedidoId) {
        return pedidoRepository.findByIdAndClienteId(pedidoId, clienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(PEDIDO_NAO_ENCONTRADO));
    }

    private PedidoAluguel obterVisivel(Agente agente, Long pedidoId) {
        PedidoAluguel pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(PEDIDO_NAO_ENCONTRADO));
        if (!pedido.visivelPara(agente)) {
            throw new RecursoNaoEncontradoException(PEDIDO_NAO_ENCONTRADO);
        }
        return pedido;
    }

    private Agente obterAgente(Long agenteId) {
        return agenteRepository.findById(agenteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agente não encontrado."));
    }

    private Automovel obterAutomovel(Long automovelId) {
        return automovelRepository.findById(automovelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Automóvel não encontrado."));
    }

    private Banco obterBanco(Long bancoId) {
        if (bancoId == null) {
            return null;
        }
        return bancoRepository.findById(bancoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Banco agente não encontrado."));
    }
}
