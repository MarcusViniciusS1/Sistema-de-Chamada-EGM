package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import com.apae.sistema.repository.ChamadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// DTO interno para enviar apenas o necessário para a tela
record AlunoRefeitorioDTO(
        String nome,
        String matricula,
        String tipoAlimentar, // "Vegetariano", "Diabético", etc.
        String status,        // "EMBARCOU" ou "NA ESCOLA"
        String alergias
) {}

@RestController
@RequestMapping("/api/refeitorio")
public class RefeitorioController {

    @Autowired
    private ChamadaRepository chamadaRepository;

    @GetMapping("/presenca-hoje")
    public List<AlunoRefeitorioDTO> listarPresentesParaRefeicao() {
        LocalDate hoje = LocalDate.now();

        // 1. Busca todas as chamadas de hoje
        List<Chamada> chamadas = chamadaRepository.findAllByDataChamada(hoje);

        // 2. Filtra apenas quem NÃO FALTOU (ou seja, Embarcou ou está na Portaria)
        return chamadas.stream()
                .filter(c -> c.getStatus() != StatusChamada.FALTA)
                .map(c -> new AlunoRefeitorioDTO(
                        c.getAluno().getNomeCompleto(),
                        c.getAluno().getMatricula(),
                        c.getAluno().getTipoAlimentar(),
                        c.getStatus() == StatusChamada.EMBARCOU ? "NO ÔNIBUS" : "NA ESCOLA",
                        c.getAluno().getAlergias()
                ))
                .collect(Collectors.toList());
    }
}