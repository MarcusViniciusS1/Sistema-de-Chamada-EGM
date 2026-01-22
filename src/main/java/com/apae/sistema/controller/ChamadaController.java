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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chamadas")
public class ChamadaController {

    @Autowired
    private ChamadaRepository chamadaRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    public record RegistroChamadaDTO(Long alunoId, String status) {}

    // DTO para o histórico da portaria
    public record HistoricoChamadaDTO(Long id, String alunoNome, String hora, String status) {}

    @PostMapping
    public void registrar(@RequestBody RegistroChamadaDTO dados) {
        Aluno aluno = alunoRepository.findById(dados.alunoId())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        LocalDate hoje = LocalDate.now();

        Chamada chamada = chamadaRepository.findByAlunoAndDataChamada(aluno, hoje)
                .orElse(new Chamada());

        chamada.setAluno(aluno);
        chamada.setDataChamada(hoje);
        // Só atualiza a hora se for registro novo, para não perder a hora original de chegada
        if (chamada.getId() == null) {
            chamada.setHoraRegistro(LocalTime.now());
        }

        try {
            chamada.setStatus(StatusChamada.valueOf(dados.status()));
        } catch (IllegalArgumentException e) {
            chamada.setStatus(StatusChamada.FALTA);
        }

        chamadaRepository.save(chamada);
    }

    // --- NOVO ENDPOINT: Histórico do Dia ---
    @GetMapping("/do-dia")
    public List<HistoricoChamadaDTO> listarDoDia() {
        LocalDate hoje = LocalDate.now();
        List<Chamada> chamadas = chamadaRepository.findAllByDataChamada(hoje);

        return chamadas.stream()
                // Ordena do mais recente para o mais antigo
                .sorted((c1, c2) -> c2.getHoraRegistro().compareTo(c1.getHoraRegistro()))
                .map(c -> new HistoricoChamadaDTO(
                        c.getAluno().getId(), // Usamos o ID do aluno para facilitar a busca
                        c.getAluno().getNomeCompleto(),
                        c.getHoraRegistro() != null ? c.getHoraRegistro().format(DateTimeFormatter.ofPattern("HH:mm")) : "--:--",
                        c.getStatus().name()
                ))
                .collect(Collectors.toList());
    }
}