package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import com.apae.sistema.repository.AlunoRepository;
import com.apae.sistema.repository.ChamadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/chamadas")
public class ChamadaController {

    @Autowired
    private ChamadaRepository chamadaRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    // DTO para receber os dados do Front
    public record RegistroChamadaDTO(Long alunoId, String status) {}

    @PostMapping
    public void registrar(@RequestBody RegistroChamadaDTO dados) {
        Aluno aluno = alunoRepository.findById(dados.alunoId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        LocalDate hoje = LocalDate.now();

        // Verifica se já existe chamada hoje para este aluno e atualiza, ou cria nova
        Chamada chamada = chamadaRepository.findByAlunoAndDataChamada(aluno, hoje)
                .orElse(new Chamada());

        chamada.setAluno(aluno);
        chamada.setDataChamada(hoje);
        chamada.setHoraRegistro(LocalTime.now());

        // Converte a String do Front para o Enum do Back
        try {
            chamada.setStatus(StatusChamada.valueOf(dados.status()));
        } catch (IllegalArgumentException e) {
            chamada.setStatus(StatusChamada.FALTA); // Fallback
        }

        chamadaRepository.save(chamada);
    }
}