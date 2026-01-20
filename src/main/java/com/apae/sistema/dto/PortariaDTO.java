package com.apae.sistema.dto;

public record PortariaDTO(
        String termo,
        String status,
        String mensagem,
        String alunoNome,
        String hora
) {}