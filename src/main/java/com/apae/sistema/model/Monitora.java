package com.apae.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "monitoras")
@Data
public class Monitora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String telefone;
    private String endereco;
    private String cpf;

    // Relacionamento 1 para 1: Uma monitora TEM UM usuário de acesso
    // CascadeType.ALL: Se apagar a monitora, apaga o usuário também
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;
}