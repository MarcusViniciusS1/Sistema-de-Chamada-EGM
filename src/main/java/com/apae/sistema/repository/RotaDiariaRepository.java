package com.apae.sistema.repository;

import com.apae.sistema.model.Onibus;
import com.apae.sistema.model.RotaDiaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface RotaDiariaRepository extends JpaRepository<RotaDiaria, Long> {
    Optional<RotaDiaria> findByOnibusAndData(Onibus onibus, LocalDate data);
}