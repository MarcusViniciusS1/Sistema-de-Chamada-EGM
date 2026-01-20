package com.apae.sistema.controller;

import com.apae.sistema.dto.DashboardDTO;
import com.apae.sistema.model.StatusChamada;
import com.apae.sistema.repository.AlunoRepository;
import com.apae.sistema.repository.ChamadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ChamadaRepository chamadaRepository;

    @GetMapping("/resumo")
    public DashboardDTO getResumo() {
        LocalDate hoje = LocalDate.now();

        // 1. Busca o total de alunos cadastrados no sistema
        long totalAlunos = alunoRepository.count();

        // 2. Conta quantos já embarcaram HOJE
        long embarcaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.EMBARCOU);

        // 3. Conta quantos faltaram HOJE
        long faltaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.FALTA);

        // 4. Calcula quem está aguardando (Total - (Embarcou + Faltou))
        // Obs: Se tiver o status 'PRESENTE_PORTARIA', deve somar ele na subtração também.
        long processados = embarcaram + faltaram;
        long aguardando = (totalAlunos > processados) ? (totalAlunos - processados) : 0;

        return new DashboardDTO(totalAlunos, embarcaram, faltaram, aguardando);
    }
}