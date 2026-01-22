package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "rota_diaria")
@Data
public class RotaDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "onibus_id")
    private Onibus onibus;

    private LocalDate data;

    private boolean concluida;
}