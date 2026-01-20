package com.apae.sistema.repository;

import com.apae.sistema.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    // Busca exata pela matrícula (ID visual 001, 002...)
    Optional<Aluno> findByMatricula(String matricula);

    // Busca exata pelo nome (para simplificar a portaria)
    Optional<Aluno> findByNomeCompletoIgnoreCase(String nome);
}