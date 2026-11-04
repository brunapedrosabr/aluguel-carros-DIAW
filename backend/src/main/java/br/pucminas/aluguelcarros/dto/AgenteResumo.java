package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Perfil;

public record AgenteResumo(Long id, String nome, Perfil perfil) {

    public static AgenteResumo from(Agente agente) {
        if (agente == null) {
            return null;
        }
        return new AgenteResumo(agente.getId(), agente.getNome(), agente.getPerfil());
    }
}
