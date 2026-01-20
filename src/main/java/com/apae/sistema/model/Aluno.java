package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alunos")
@Data
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSequencial; // ID interno do banco

    private String matricula; // NOVO: O ID visual (ex: "001")

    @Column(nullable = false)
    private String nomeCompleto;

    private String sexo;
    private Integer idade;

    @Column(nullable = false)
    private String tipoAlimentar;

    private String alergias;
    private String deficiencia;
    private String enderecoResidencial;

    private Long paradaId;
}