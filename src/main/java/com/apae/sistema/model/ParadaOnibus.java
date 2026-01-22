package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "paradas_onibus") // Nome exato da tabela no banco
@Data
public class ParadaOnibus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_parada", nullable = false)
    private String nomeParada;

    private String endereco;
    private String latitude;
    private String longitude;

    @ManyToOne
    @JoinColumn(name = "onibus_id") // Nome da coluna no banco (snake_case)
    private Onibus onibus; // Nome do atributo no Java (camelCase)
}