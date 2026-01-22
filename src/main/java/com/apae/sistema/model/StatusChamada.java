package com.apae.sistema.model;

public enum StatusChamada {
    AGUARDANDO,       // Padrão inicial (se necessário)
    EMBARCOU,         // Veio de Ônibus
    PRESENTE,         // Veio pela Portaria/Pais (Substitui o PRESENTE_PORTARIA para facilitar o código)
    FALTA,            // Faltou
    JUSTIFICADO       // Falta Justificada (Para uso futuro)
}