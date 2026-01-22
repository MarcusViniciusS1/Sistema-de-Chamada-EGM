package com.apae.sistema.repository;

import com.apae.sistema.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    // 1. Busca alunos de uma parada específica (Para a Rota da Monitora)
    List<Aluno> findByParadaId(Long paradaId);

    // 2. Busca exata por Matrícula (Para o registro manual/fora do padrão)
    Optional<Aluno> findByMatricula(String matricula);

    // 3. Busca por Nome Completo ignorando maiúsculas/minúsculas
    Optional<Aluno> findByNomeCompletoIgnoreCase(String nomeCompleto);
}