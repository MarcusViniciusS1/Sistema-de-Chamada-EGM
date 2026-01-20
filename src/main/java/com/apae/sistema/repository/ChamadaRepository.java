package com.apae.sistema.repository;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ChamadaRepository extends JpaRepository<Chamada, Long> {

    // Contagem para o Dashboard
    long countByDataChamadaAndStatus(LocalDate dataChamada, StatusChamada status);

    // Verifica duplicidade (se já tem chamada no dia)
    boolean existsByAlunoAndDataChamada(Aluno aluno, LocalDate dataChamada);

    // Busca lista completa de chamadas de uma data (para exibir status na lista da Monitora)
    List<Chamada> findAllByDataChamada(LocalDate dataChamada);

    // Deletar tudo de uma data específica (Reset do Admin)
    void deleteByDataChamada(LocalDate dataChamada);

    // Buscar registro específico para atualização (correção de embarque da Monitora)
    Chamada findByAlunoAndDataChamada(Aluno aluno, LocalDate dataChamada);

    // NOVO: Busca histórico específico da portaria ordenado por hora (últimos primeiro)
    List<Chamada> findByDataChamadaAndRegistradoPorOrderByHoraRegistroDesc(LocalDate dataChamada, String registradoPor);
}