package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "onibus")
@Data
public class Onibus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeOnibus;
    private String nomeMotorista;
    private String placa;
    private String cor;
    private Integer capacidadeMaxima;
    private Boolean suportaDeficiente;

    // Relacionamento: Um ônibus tem várias paradas
    // CascadeType.ALL significa: se salvar o ônibus, salva as paradas junto
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "onibus_id")
    private List<ParadaOnibus> paradas = new ArrayList<>();
}