package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "chamada_diaria")
@Data
public class Chamada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    private LocalDate dataChamada;
    private LocalTime horaRegistro;

    @Enumerated(EnumType.STRING)
    private StatusChamada status;

    private String registradoPor;
}