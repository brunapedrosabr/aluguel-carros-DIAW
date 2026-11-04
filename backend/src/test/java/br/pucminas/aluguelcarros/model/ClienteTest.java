package br.pucminas.aluguelcarros.model;

import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ClienteTest {

    private Cliente novoCliente() {
        return new Cliente("ana", "hash", "Ana", "MG-1", "123.456.789-09",
                new Endereco("Rua A, 1", "Centro", "Belo Horizonte", "MG", "30000-000"), "Arquiteta");
    }

    @Test
    void aceitaAteTresRendimentosESomaARenda() {
        Cliente cliente = novoCliente();
        cliente.adicionarRendimento("Empresa A", new BigDecimal("1000.00"));
        cliente.adicionarRendimento("Empresa B", new BigDecimal("2000.50"));
        cliente.adicionarRendimento("Empresa C", new BigDecimal("500.00"));

        assertEquals(3, cliente.getRendimentos().size());
        assertEquals(new BigDecimal("3500.50"), cliente.getRendaTotal());
    }

    @Test
    void recusaQuartoRendimento() {
        Cliente cliente = novoCliente();
        cliente.adicionarRendimento("A", BigDecimal.TEN);
        cliente.adicionarRendimento("B", BigDecimal.TEN);
        cliente.adicionarRendimento("C", BigDecimal.TEN);

        assertThrows(RegraNegocioException.class, () -> cliente.adicionarRendimento("D", BigDecimal.TEN));
    }

    @Test
    void recusaRendimentoSemValorPositivo() {
        Cliente cliente = novoCliente();
        assertThrows(RegraNegocioException.class, () -> cliente.adicionarRendimento("A", BigDecimal.ZERO));
    }

    @Test
    void limparPermiteCadastrarNovosRendimentos() {
        Cliente cliente = novoCliente();
        cliente.adicionarRendimento("A", BigDecimal.ONE);
        cliente.adicionarRendimento("B", BigDecimal.ONE);
        cliente.adicionarRendimento("C", BigDecimal.ONE);
        cliente.limparRendimentos();
        cliente.adicionarRendimento("D", BigDecimal.ONE);

        assertEquals(1, cliente.getRendimentos().size());
    }
}
