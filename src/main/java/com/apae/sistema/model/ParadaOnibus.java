package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "paradas_onibus")
@Data
public class ParadaOnibus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeParada;
    private String endereco;
    private String latitude;
    private String longitude;
    private Integer ordemParada;
}