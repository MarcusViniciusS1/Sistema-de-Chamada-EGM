package com.apae.sistema.controller;

import com.apae.sistema.repository.ChamadaRepository;
import com.apae.sistema.repository.RotaDiariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/sistema")
public class SistemaController {

    @Autowired
    private ChamadaRepository chamadaRepository;

    @Autowired
    private RotaDiariaRepository rotaDiariaRepository;

    @DeleteMapping("/resetar-dia")
    @Transactional // Importante para permitir o DELETE
    public void resetarDia() {
        LocalDate hoje = LocalDate.now();

        // 1. Apaga todas as presenças/faltas de hoje
        chamadaRepository.deleteByDataChamada(hoje);

        // 2. Apaga o status de "Concluído" dos ônibus de hoje
        rotaDiariaRepository.deleteByData(hoje);

        System.out.println("SISTEMA RESETADO PARA O DIA: " + hoje);
    }
}