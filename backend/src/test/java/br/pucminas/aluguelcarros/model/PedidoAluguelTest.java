package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PedidoAluguelTest {

    private static final LocalDate INICIO = LocalDate.of(2030, 1, 10);
    private static final LocalDate FIM = LocalDate.of(2030, 1, 17);

    private Cliente cliente;
    private Automovel automovel;
    private Banco horizonte;
    private Banco serra;
    private Empresa locadora;

    @BeforeEach
    void preparar() {
        cliente = new Cliente("ana", "hash", "Ana", "MG-1", "123.456.789-09",
                new Endereco("Rua A, 1", "Centro", "Belo Horizonte", "MG", "30000-000"), "Arquiteta");
        automovel = new Automovel("001", 2024, "Fiat", "Argo", "PUC2M26");
        horizonte = new Banco("horizonte", "hash", "Banco Horizonte", "11");
        serra = new Banco("serra", "hash", "Banco Serra Azul", "22");
        locadora = new Empresa("locadora", "hash", "Locadora Via Norte", "33");
    }

    private PedidoAluguel pedidoSemCredito() {
        return new PedidoAluguel(cliente, automovel, INICIO, FIM, TipoProprietario.CLIENTE, null);
    }

    private PedidoAluguel pedidoComCredito() {
        return new PedidoAluguel(cliente, automovel, INICIO, FIM, TipoProprietario.BANCO, horizonte);
    }

    @Test
    void novoPedidoComecaEmAnaliseEContaDiarias() {
        PedidoAluguel pedido = pedidoSemCredito();
        assertEquals(StatusPedido.EM_ANALISE, pedido.getStatus());
        assertEquals(7, pedido.getQuantidadeDiarias());
    }

    @Test
    void devolucaoDeveSerDepoisDaRetirada() {
        assertThrows(RegraNegocioException.class,
                () -> new PedidoAluguel(cliente, automovel, FIM, INICIO, TipoProprietario.CLIENTE, null));
    }

    @Test
    void registroEmNomeDoBancoExigeCredito() {
        assertThrows(RegraNegocioException.class,
                () -> new PedidoAluguel(cliente, automovel, INICIO, FIM, TipoProprietario.BANCO, null));
    }

    @Test
    void pedidoComCreditoSoEVisivelAoBancoEscolhido() {
        PedidoAluguel pedido = pedidoComCredito();
        assertTrue(pedido.visivelPara(horizonte));
        assertFalse(pedido.visivelPara(serra));
        assertFalse(pedido.visivelPara(locadora));
        assertThrows(RegraNegocioException.class, () -> pedido.avaliar(serra, true, "ok"));
    }

    @Test
    void pedidoSemCreditoPodeSerAvaliadoPorQualquerAgente() {
        PedidoAluguel pedido = pedidoSemCredito();
        pedido.avaliar(locadora, false, "Renda insuficiente para o período.");
        assertEquals(StatusPedido.REPROVADO, pedido.getStatus());
        assertEquals(locadora, pedido.getAgenteAvaliador());
    }

    @Test
    void parecerExigeJustificativa() {
        PedidoAluguel pedido = pedidoSemCredito();
        assertThrows(RegraNegocioException.class, () -> pedido.avaliar(locadora, true, "  "));
    }

    @Test
    void naoPodeModificarDepoisDoParecer() {
        PedidoAluguel pedido = pedidoSemCredito();
        pedido.avaliar(locadora, true, "Aprovado.");
        assertThrows(RegraNegocioException.class,
                () -> pedido.modificar(automovel, INICIO, FIM.plusDays(1), TipoProprietario.CLIENTE, null));
    }

    @Test
    void contratoComCreditoGeraContratoDeCreditoComOBanco() {
        PedidoAluguel pedido = pedidoComCredito();
        pedido.avaliar(horizonte, true, "Renda compatível.");

        Contrato contrato = Contrato.executar(pedido, horizonte);

        assertEquals(StatusPedido.CONTRATADO, pedido.getStatus());
        assertEquals(TipoProprietario.BANCO, contrato.getTipoProprietario());
        assertNotNull(contrato.getContratoCredito());
        assertEquals(horizonte, contrato.getContratoCredito().getBanco());
        assertThrows(RegraNegocioException.class, pedido::cancelar);
    }

    @Test
    void contratoSemCreditoNaoGeraContratoDeCredito() {
        PedidoAluguel pedido = pedidoSemCredito();
        pedido.avaliar(locadora, true, "Aprovado.");
        Contrato contrato = Contrato.executar(pedido, locadora);
        assertNull(contrato.getContratoCredito());
    }

    @Test
    void contratoSoPodeSerExecutadoPeloAgenteQueAprovou() {
        PedidoAluguel pedido = pedidoSemCredito();
        pedido.avaliar(locadora, true, "Aprovado.");
        assertThrows(RegraNegocioException.class, () -> Contrato.executar(pedido, horizonte));
    }

    @Test
    void contratoExigeParecerPositivo() {
        PedidoAluguel pedido = pedidoSemCredito();
        assertThrows(RegraNegocioException.class, () -> Contrato.executar(pedido, locadora));
    }

    @Test
    void clientePodeCancelarPedidoAprovado() {
        PedidoAluguel pedido = pedidoSemCredito();
        pedido.avaliar(locadora, true, "Aprovado.");
        pedido.cancelar();
        assertEquals(StatusPedido.CANCELADO, pedido.getStatus());
    }
}
