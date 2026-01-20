package com.apae.sistema.dto;

public record DashboardDTO(
        long totalAlunos,
        long embarcaram,
        long faltaram,
        long aguardando,
        long presentesPortaria
) {}