package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.ClienteRequest;
import br.pucminas.aluguelcarros.dto.ClienteResponse;
import br.pucminas.aluguelcarros.dto.RendimentoDTO;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** CRUD de cliente: cadastro (create), consulta (read), atualização (update) e exclusão (delete). */
@Service
public class ClienteService {

    private static final int TAMANHO_MINIMO_SENHA = 6;

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;

    public ClienteService(ClienteRepository clienteRepository, UsuarioRepository usuarioRepository,
                          PedidoAluguelRepository pedidoRepository, PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ClienteResponse cadastrar(ClienteRequest request) {
        validarSenha(request.senha(), true);
        String login = request.login().trim();
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Este nome de usuário já está em uso.");
        }
        String cpf = normalizarCpf(request.cpf());
        if (clienteRepository.existsByCpf(cpf)) {
            throw new RegraNegocioException("Já existe um cliente cadastrado com este CPF.");
        }
        Cliente cliente = new Cliente(
                login,
                passwordEncoder.encode(request.senha()),
                request.nome().trim(),
                request.rg().trim(),
                cpf,
                request.endereco().toModel(),
                request.profissao().trim());
        aplicarRendimentos(cliente, request.rendimentos());
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id) {
        return ClienteResponse.from(obter(id));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = obter(id);
        String login = request.login().trim();
        if (!login.equals(cliente.getLogin()) && usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Este nome de usuário já está em uso.");
        }
        String cpf = normalizarCpf(request.cpf());
        if (clienteRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new RegraNegocioException("Já existe um cliente cadastrado com este CPF.");
        }
        cliente.atualizarDados(login, request.nome().trim(), request.rg().trim(), cpf,
                request.endereco().toModel(), request.profissao().trim());
        if (request.senha() != null && !request.senha().isBlank()) {
            validarSenha(request.senha(), false);
            cliente.alterarSenha(passwordEncoder.encode(request.senha()));
        }
        cliente.limparRendimentos();
        aplicarRendimentos(cliente, request.rendimentos());
        return ClienteResponse.from(cliente);
    }

    @Transactional
    public void excluir(Long id) {
        Cliente cliente = obter(id);
        if (pedidoRepository.existsByClienteIdAndStatusIn(id, List.of(StatusPedido.CONTRATADO))) {
            throw new RegraNegocioException(
                    "Não é possível excluir o cadastro: existem contratos executados vinculados a ele.");
        }
        if (pedidoRepository.existsByClienteIdAndStatusIn(id, List.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO))) {
            throw new RegraNegocioException("Cancele seus pedidos em andamento antes de excluir o cadastro.");
        }
        pedidoRepository.deleteAll(pedidoRepository.findByClienteIdOrderByCriadoEmDesc(id));
        pedidoRepository.flush();
        clienteRepository.delete(cliente);
    }

    private Cliente obter(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
    }

    private void aplicarRendimentos(Cliente cliente, List<RendimentoDTO> rendimentos) {
        if (rendimentos == null) {
            return;
        }
        for (RendimentoDTO rendimento : rendimentos) {
            cliente.adicionarRendimento(rendimento.entidadeEmpregadora().trim(), rendimento.valor());
        }
    }

    private void validarSenha(String senha, boolean obrigatoria) {
        if (senha == null || senha.isBlank()) {
            if (obrigatoria) {
                throw new RegraNegocioException("Informe uma senha.");
            }
            return;
        }
        if (senha.length() < TAMANHO_MINIMO_SENHA) {
            throw new RegraNegocioException("A senha deve ter pelo menos " + TAMANHO_MINIMO_SENHA + " caracteres.");
        }
    }

    /** Guarda o CPF sempre no formato 000.000.000-00. */
    static String normalizarCpf(String cpf) {
        String digitos = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (digitos.length() != 11) {
            throw new RegraNegocioException("CPF inválido.");
        }
        return digitos.substring(0, 3) + "." + digitos.substring(3, 6) + "." + digitos.substring(6, 9)
                + "-" + digitos.substring(9);
    }
}
