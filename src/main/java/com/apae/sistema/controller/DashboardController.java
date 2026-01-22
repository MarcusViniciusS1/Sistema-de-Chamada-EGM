package com.apae.sistema.controller;

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
    private ChamadaRepository chamadaRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    public record ResumoDashboardDTO(
            long totalAlunos,
            long embarcaram,
            long presentesPortaria,
            long faltaram,
            long aguardando
    ) {}

    @GetMapping("/resumo")
    public ResumoDashboardDTO getResumo() {
        LocalDate hoje = LocalDate.now();

        long totalAlunos = alunoRepository.count();

        // CORREÇÃO: Usando os nomes novos do Enum
        long embarcaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.EMBARCOU);
        long presentesPortaria = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.PRESENTE); // <-- Mudado aqui
        long faltaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.FALTA);

        // Quem não tem chamada registrada ainda está "Aguardando"
        long processados = embarcaram + presentesPortaria + faltaram;
        long aguardando = (totalAlunos > processados) ? totalAlunos - processados : 0;

        return new ResumoDashboardDTO(totalAlunos, embarcaram, presentesPortaria, faltaram, aguardando);
    }
}