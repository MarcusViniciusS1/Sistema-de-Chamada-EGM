package com.apae.sistema.controller;

import com.apae.sistema.model.*;
import com.apae.sistema.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitora")
public class MonitoraController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private OnibusRepository onibusRepository;
    @Autowired
    private ParadaRepository paradaRepository;
    @Autowired
    private AlunoRepository alunoRepository;
    @Autowired
    private RotaDiariaRepository rotaDiariaRepository;
    @Autowired
    private ChamadaRepository chamadaRepository; // Adicionado para contar presenças

    // DTOs
    public record DadosRotaDTO(Long onibusId, String nomeOnibus, String placa, List<ParadaComAlunosDTO> paradas) {}
    public record ParadaComAlunosDTO(Long id, String nomeParada, String endereco, List<Aluno> alunosEsperados) {}

    // ATUALIZADO: Agora retorna contagens por ônibus
    public record StatusRotaDTO(
            Long onibusId,
            boolean concluida,
            int totalAlunos,
            int embarcaram,
            int faltaram
    ) {}

    // 1. Rota Atual (Monitora)
    @GetMapping("/rota-atual/{usuarioId}")
    public DadosRotaDTO getRotaAtual(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        if (usuario.getOnibus() == null) throw new RuntimeException("Usuário sem ônibus.");
        return montarDadosRota(usuario.getOnibus());
    }

    // 2. Rota por Ônibus (Admin)
    @GetMapping("/rota-por-onibus/{onibusId}")
    public DadosRotaDTO getRotaPorOnibus(@PathVariable Long onibusId) {
        Onibus onibus = onibusRepository.findById(onibusId).orElseThrow();
        return montarDadosRota(onibus);
    }

    // 3. Finalizar Rota
    @PostMapping("/finalizar/{onibusId}")
    public void finalizarRota(@PathVariable Long onibusId) {
        Onibus onibus = onibusRepository.findById(onibusId).orElseThrow();
        LocalDate hoje = LocalDate.now();

        RotaDiaria rota = rotaDiariaRepository.findByOnibusAndData(onibus, hoje)
                .orElse(new RotaDiaria());

        rota.setOnibus(onibus);
        rota.setData(hoje);
        rota.setConcluida(true);

        rotaDiariaRepository.save(rota);
    }

    // 4. Status do Dia (Individual)
    @GetMapping("/status-dia/{onibusId}")
    public StatusRotaDTO getStatusDia(@PathVariable Long onibusId) {
        return calcularStatusUnico(onibusId);
    }

    // 5. Status da Frota (Para o Dashboard - ATUALIZADO)
    @GetMapping("/status-frota")
    public List<StatusRotaDTO> getStatusFrota() {
        LocalDate hoje = LocalDate.now();
        List<Chamada> chamadasHoje = chamadaRepository.findAllByDataChamada(hoje); // Pega tudo de uma vez para ser rápido

        return onibusRepository.findAll().stream().map(onibus -> {
            // 1. Verifica se está concluída
            boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, hoje)
                    .map(RotaDiaria::isConcluida)
                    .orElse(false);

            // 2. Busca alunos deste ônibus (através das paradas)
            List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());
            List<Aluno> alunosDoOnibus = paradas.stream()
                    .flatMap(p -> alunoRepository.findByParadaId(p.getId()).stream())
                    .toList();

            int total = alunosDoOnibus.size();
            int embarcaram = 0;
            int faltaram = 0;

            // 3. Cruza com as chamadas de hoje
            for (Aluno aluno : alunosDoOnibus) {
                Optional<Chamada> chamada = chamadasHoje.stream()
                        .filter(c -> c.getAluno().getId().equals(aluno.getId()))
                        .findFirst();

                if (chamada.isPresent()) {
                    if (chamada.get().getStatus() == StatusChamada.EMBARCOU) embarcaram++;
                    else if (chamada.get().getStatus() == StatusChamada.FALTA) faltaram++;
                }
            }

            return new StatusRotaDTO(onibus.getId(), concluida, total, embarcaram, faltaram);
        }).collect(Collectors.toList());
    }

    // Auxiliar para calcular um único ônibus (reaproveita lógica se precisar)
    private StatusRotaDTO calcularStatusUnico(Long onibusId) {
        // Lógica simplificada para retorno rápido no check de bloqueio
        Onibus onibus = onibusRepository.findById(onibusId).orElseThrow();
        boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, LocalDate.now())
                .map(RotaDiaria::isConcluida)
                .orElse(false);
        return new StatusRotaDTO(onibusId, concluida, 0, 0, 0);
    }

    private DadosRotaDTO montarDadosRota(Onibus onibus) {
        List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());
        List<ParadaComAlunosDTO> listaParadas = paradas.stream().map(parada -> {
            List<Aluno> alunos = alunoRepository.findByParadaId(parada.getId());
            return new ParadaComAlunosDTO(parada.getId(), parada.getNomeParada(), parada.getEndereco(), alunos);
        }).toList();
        return new DadosRotaDTO(onibus.getId(), onibus.getNomeOnibus(), onibus.getPlaca(), listaParadas);
    }
}