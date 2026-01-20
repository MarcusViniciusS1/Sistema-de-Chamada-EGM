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

        long totalAlunos = alunoRepository.count();
        long embarcaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.EMBARCOU);
        long faltaram = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.FALTA);
        long presentesPortaria = chamadaRepository.countByDataChamadaAndStatus(hoje, StatusChamada.PRESENTE_PORTARIA);
        long processados = embarcaram + faltaram + presentesPortaria;
        long aguardando = (totalAlunos > processados) ? (totalAlunos - processados) : 0;

        return new DashboardDTO(totalAlunos, embarcaram, faltaram, aguardando, presentesPortaria);
    }
}