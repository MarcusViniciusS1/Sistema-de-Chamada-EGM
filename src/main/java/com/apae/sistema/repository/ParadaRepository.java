package com.apae.sistema.repository;

import com.apae.sistema.model.ParadaOnibus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParadaRepository extends JpaRepository<ParadaOnibus, Long> {

    // Use o underline (_) para indicar que queremos navegar dentro do objeto 'onibus' e pegar o 'id'
    List<ParadaOnibus> findByOnibus_Id(Long onibusId);
}