package br.pucminas.aluguelcarros.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ContratanteResponseTest {

    @Test
    void mascaraCpf() {
        assertEquals("***.456.789-**", ContratanteResponse.mascararCpf("123.456.789-09"));
        assertEquals("***", ContratanteResponse.mascararCpf("123"));
    }

    @Test
    void mascaraRgMantendoTresUltimosCaracteres() {
        assertEquals("**-**.***.678", ContratanteResponse.mascararRg("MG-12.345.678"));
    }
}
