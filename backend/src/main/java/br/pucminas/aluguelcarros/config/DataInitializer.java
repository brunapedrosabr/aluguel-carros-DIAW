package br.pucminas.aluguelcarros.config;

import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Endereco;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.BancoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Popula o banco na primeira execução: automóveis e agentes (empresas e bancos),
 * que não se cadastram pela tela. Com app.seed.demo=true, cria também uma cliente
 * de demonstração com um pedido em análise.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String SENHA_AGENTES = "agente123";
    private static final String SENHA_CLIENTE_DEMO = "cliente123";

    private final UsuarioRepository usuarioRepository;
    private final AutomovelRepository automovelRepository;
    private final BancoRepository bancoRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean criarDemo;

    public DataInitializer(UsuarioRepository usuarioRepository, AutomovelRepository automovelRepository,
                           BancoRepository bancoRepository, PedidoAluguelRepository pedidoRepository,
                           PasswordEncoder passwordEncoder, @Value("${app.seed.demo:true}") boolean criarDemo) {
        this.usuarioRepository = usuarioRepository;
        this.automovelRepository = automovelRepository;
        this.bancoRepository = bancoRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
        this.criarDemo = criarDemo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (automovelRepository.count() == 0) {
            automovelRepository.saveAll(List.of(
                    new Automovel("00987654321", 2024, "Fiat", "Argo Drive 1.0", "PUC2M26"),
                    new Automovel("01123456789", 2025, "Chevrolet", "Onix Plus", "RDR1A26"),
                    new Automovel("00876543210", 2023, "Volkswagen", "Polo Track", "QXT4B21"),
                    new Automovel("00765432109", 2022, "Renault", "Kwid Zen", "MGS3C77"),
                    new Automovel("01234567890", 2025, "Jeep", "Renegade", "JPR5D12")));
            log.info("Automóveis de exemplo cadastrados.");
        }

        if (!usuarioRepository.existsByLogin("banco.horizonte")) {
            String senha = passwordEncoder.encode(SENHA_AGENTES);
            usuarioRepository.saveAll(List.of(
                    new Banco("banco.horizonte", senha, "Banco Horizonte", "11.111.111/0001-11"),
                    new Banco("banco.serra", senha, "Banco Serra Azul", "22.222.222/0001-22"),
                    new Empresa("via.norte", senha, "Locadora Via Norte", "33.333.333/0001-33")));
            log.info("Agentes cadastrados: banco.horizonte, banco.serra, via.norte (senha: {}).", SENHA_AGENTES);
        }

        if (criarDemo && !usuarioRepository.existsByLogin("ana.ribeiro")) {
            criarClienteDemo();
        }
    }

    private void criarClienteDemo() {
        Cliente ana = new Cliente(
                "ana.ribeiro",
                passwordEncoder.encode(SENHA_CLIENTE_DEMO),
                "Ana Ribeiro",
                "MG-12.345.678",
                "123.456.789-09",
                new Endereco("Rua das Acácias, 120", "Centro", "Juiz de Fora", "MG", "36010-000"),
                "Arquiteta");
        ana.adicionarRendimento("Estúdio Traço Livre", new BigDecimal("6200.00"));
        ana.adicionarRendimento("Consultoria autônoma", new BigDecimal("2100.00"));
        ana.adicionarRendimento("Aulas particulares", new BigDecimal("1500.00"));
        usuarioRepository.save(ana);

        Automovel argo = automovelRepository.findByPlaca("PUC2M26").orElse(null);
        Banco horizonte = bancoRepository.findByLogin("banco.horizonte").orElse(null);
        if (argo != null && horizonte != null) {
            LocalDate retirada = LocalDate.now().plusDays(10);
            pedidoRepository.save(new PedidoAluguel(ana, argo, retirada, retirada.plusDays(7),
                    TipoProprietario.BANCO, horizonte));
        }
        log.info("Cliente de demonstração cadastrada: ana.ribeiro (senha: {}).", SENHA_CLIENTE_DEMO);
    }
}
