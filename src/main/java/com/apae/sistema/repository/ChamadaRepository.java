package com.apae.sistema.repository;

import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface ChamadaRepository extends JpaRepository<Chamada, Long> {
    // Conta quantos alunos estão com status X (ex: EMBARCOU) na data de hoje
    long countByDataChamadaAndStatus(LocalDate dataChamada, StatusChamada status);
}