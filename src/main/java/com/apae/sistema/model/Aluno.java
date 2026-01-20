package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alunos")
@Data // Lombok gera Getters e Setters automaticamente
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSequencial;

    @Column(nullable = false)
    private String nomeCompleto;

    private String sexo;
    private Integer idade;

    @Column(nullable = false)
    private String tipoAlimentar; // Ex: DIABETICO, VEGETARIANO

    private String alergias;
    private String deficiencia;
    private String enderecoResidencial;

    // Relacionamento com a Parada (Simplificado por enquanto)
    private Long paradaId;
}