package com.apae.sistema.repository;

import com.apae.sistema.model.ParadaOnibus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParadaOnibusRepository extends JpaRepository<ParadaOnibus, Long> {

    // Método necessário para filtrar paradas de um ônibus específico
    List<ParadaOnibus> findByOnibus_Id(Long onibusId);
}