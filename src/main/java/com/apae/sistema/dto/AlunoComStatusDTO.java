package com.apae.sistema.dto;

import com.apae.sistema.model.Aluno;

// Este objeto carrega os dados do aluno + o status dele HOJE
public record AlunoComStatusDTO(
        Long idSequencial,
        String matricula,
        String nomeCompleto,
        String enderecoResidencial,
        String statusHoje // "AGUARDANDO", "EMBARCOU", "PRESENTE_PORTARIA", "FALTA"
) {
    // Construtor auxiliar para facilitar a conversão
    public static AlunoComStatusDTO from(Aluno aluno, String status) {
        return new AlunoComStatusDTO(
                aluno.getIdSequencial(),
                aluno.getMatricula(),
                aluno.getNomeCompleto(),
                aluno.getEnderecoResidencial(),
                status
        );
    }
}