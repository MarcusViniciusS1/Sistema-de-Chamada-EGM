package com.apae.sistema.dto;

public record MonitoraDTO(
        Long id,
        String nome,
        String telefone,
        String endereco,
        String cpf,
        String username, // Para o login
        String senha     // Para o login
) {}
