package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "onibus")
@Data
public class Onibus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_onibus", nullable = false)
    private String nomeOnibus;

    @Column(name = "nome_motorista")
    private String nomeMotorista;

    @Column(unique = true, nullable = false)
    private String placa;

    private String cor;

    @Column(name = "capacidade_maxima")
    private Integer capacidadeMaxima;

    @Column(name = "suporta_deficiente")
    private Boolean suportaDeficiente;
}