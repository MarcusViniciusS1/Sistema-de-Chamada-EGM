package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String senha;

    // Perfis: "ADMIN", "MONITOR", "PORTEIRO", "REFEITORIO"
    @Column(nullable = false)
    private String perfil;

    // NOVO: Vínculo com o Ônibus (Apenas para Monitoras)
    // O @ManyToOne diz que vários usuários podem ser do mesmo ônibus (ex: monitora da manhã e da tarde)
    @ManyToOne
    @JoinColumn(name = "onibus_id")
    private Onibus onibus;
}