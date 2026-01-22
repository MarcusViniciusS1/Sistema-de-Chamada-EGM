package com.apae.sistema.dto;

import com.apae.sistema.model.Aluno;
import lombok.Data;

@Data
public class AlunoComStatusDTO {
    private Long id;
    private String nomeCompleto;
    private String matricula;
    private String tipoAlimentar;
    private String statusHoje;

    public AlunoComStatusDTO(Aluno aluno, String statusHoje) {
        // CORREÇÃO: O método correto gerado pelo Lombok é getId()
        this.id = aluno.getId();

        this.nomeCompleto = aluno.getNomeCompleto();
        this.matricula = aluno.getMatricula();
        this.tipoAlimentar = aluno.getTipoAlimentar();
        this.statusHoje = statusHoje;
    }
}