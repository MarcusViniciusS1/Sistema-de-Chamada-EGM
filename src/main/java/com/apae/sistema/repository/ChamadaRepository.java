package com.apae.sistema.repository;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChamadaRepository extends JpaRepository<Chamada, Long> {

    // 1. Busca Individual (Usado no Monitora)
    Optional<Chamada> findByAlunoAndDataChamada(Aluno aluno, LocalDate dataChamada);

    // 2. Contagens (Usado no Dashboard)
    long countByDataChamadaAndStatus(LocalDate dataChamada, StatusChamada status);

    // --- NOVOS MÉTODOS PARA CORRIGIR OS ERROS ---

    // 3. Listar todos do dia (Usado no Refeitório)
    List<Chamada> findAllByDataChamada(LocalDate dataChamada);

    // 4. Verificar se já existe (Usado no Agendador)
    boolean existsByAlunoAndDataChamada(Aluno aluno, LocalDate dataChamada);

    // 5. Limpeza de chamadas antigas (Usado no Agendador)
    void deleteByDataChamada(LocalDate dataChamada);
}