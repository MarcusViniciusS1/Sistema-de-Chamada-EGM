package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alunos") // CORREÇÃO: Nome no plural igual ao banco
@Data
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(unique = true, nullable = false)
    private String matricula;

    private Integer idade;

    private String sexo;

    @Column(name = "tipo_alimentar")
    private String tipoAlimentar;

    private String alergias;

    private String deficiencia;

    @Column(name = "endereco_residencial")
    private String enderecoResidencial;

    @ManyToOne
    @JoinColumn(name = "parada_id")
    private ParadaOnibus parada;
}