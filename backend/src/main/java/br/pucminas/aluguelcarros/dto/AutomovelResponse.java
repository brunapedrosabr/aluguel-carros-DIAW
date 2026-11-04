package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Automovel;

public record AutomovelResponse(Long id, String matricula, Integer ano, String marca, String modelo, String placa) {

    public static AutomovelResponse from(Automovel automovel) {
        return new AutomovelResponse(automovel.getId(), automovel.getMatricula(), automovel.getAno(),
                automovel.getMarca(), automovel.getModelo(), automovel.getPlaca());
    }
}
