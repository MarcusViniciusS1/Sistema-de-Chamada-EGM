package com.apae.sistema.repository;

import com.apae.sistema.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    List<Aluno> findByParadaId(Long paradaId);
    Optional<Aluno> findByMatricula(String matricula);
    Optional<Aluno> findByNomeCompletoIgnoreCase(String nomeCompleto);

    // --- CORREÇÃO FINAL: Usando Sub-Select para pegar o id_sequencial correto ---
    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM chamada_diaria 
        WHERE aluno_id IN (
            SELECT id_sequencial FROM alunos WHERE id = :alunoId
        )
    """, nativeQuery = true)
    void deletarHistoricoChamadas(@Param("alunoId") Long alunoId);
}