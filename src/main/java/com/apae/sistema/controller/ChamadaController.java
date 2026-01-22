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

    // --- DTOs (Data Transfer Objects) ---

    // DTO para receber os dados do Frontend (Registro)
    public record RegistroChamadaDTO(Long alunoId, String status) {}

    // DTO para enviar o histórico para a Portaria
    public record HistoricoChamadaDTO(Long id, String alunoNome, String hora, String status) {}

    // DTO para o Relatório de Emergência (Bombeiros)
    public record RelatorioEvacuacaoDTO(
            String nomeAluno,
            Integer idade,
            String deficiencia, // Importante para resgate (ex: Cadeirante)
            String turmaOuParada,
            String horaChegada
    ) {}

    // --- ENDPOINTS ---

    // 1. REGISTRAR PRESENÇA/FALTA
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

        // Só define a hora se for um registro novo (preserva a hora da primeira marcação)
        if (chamada.getId() == null) {
            chamada.setHoraRegistro(LocalTime.now());
        }

        // Converte a String do Front para o Enum do Back
        try {
            chamada.setStatus(StatusChamada.valueOf(dados.status()));
        } catch (IllegalArgumentException e) {
            chamada.setStatus(StatusChamada.FALTA); // Fallback de segurança
        }

        chamadaRepository.save(chamada);
    }

    // 2. LISTAR HISTÓRICO DO DIA (Para a Portaria)
    @GetMapping("/do-dia")
    public List<HistoricoChamadaDTO> listarDoDia() {
        LocalDate hoje = LocalDate.now();
        List<Chamada> chamadas = chamadaRepository.findAllByDataChamada(hoje);

        return chamadas.stream()
                // Ordena do mais recente para o mais antigo para facilitar visualização
                .sorted((c1, c2) -> {
                    if (c1.getHoraRegistro() == null) return 1;
                    if (c2.getHoraRegistro() == null) return -1;
                    return c2.getHoraRegistro().compareTo(c1.getHoraRegistro());
                })
                .map(c -> new HistoricoChamadaDTO(
                        c.getAluno().getId(),
                        c.getAluno().getNomeCompleto(),
                        c.getHoraRegistro() != null ? c.getHoraRegistro().format(DateTimeFormatter.ofPattern("HH:mm")) : "--:--",
                        c.getStatus().name()
                ))
                .collect(Collectors.toList());
    }

    // 3. GERAR RELATÓRIO DE EVACUAÇÃO (Para o Dashboard/Bombeiros)
    @GetMapping("/relatorio-evacuacao")
    public List<RelatorioEvacuacaoDTO> gerarRelatorioEvacuacao() {
        LocalDate hoje = LocalDate.now();
        List<Chamada> chamadas = chamadaRepository.findAllByDataChamada(hoje);

        return chamadas.stream()
                // Filtra apenas quem está PRESENTE ou EMBARCOU (quem está fisicamente na escola ou a caminho)
                .filter(c -> c.getStatus() == StatusChamada.EMBARCOU || c.getStatus() == StatusChamada.PRESENTE)
                .map(c -> new RelatorioEvacuacaoDTO(
                        c.getAluno().getNomeCompleto(),
                        c.getAluno().getIdade(),
                        // Garante que não vá nulo para o relatório
                        c.getAluno().getDeficiencia() != null && !c.getAluno().getDeficiencia().isEmpty()
                                ? c.getAluno().getDeficiencia()
                                : "Nenhuma",
                        // Mostra a parada (rota) ou "Portaria" se veio a pé
                        c.getAluno().getParada() != null
                                ? c.getAluno().getParada().getNomeParada()
                                : "Portaria/Pais",
                        c.getHoraRegistro() != null
                                ? c.getHoraRegistro().format(DateTimeFormatter.ofPattern("HH:mm"))
                                : "--:--"
                ))
                .collect(Collectors.toList());
    }
}