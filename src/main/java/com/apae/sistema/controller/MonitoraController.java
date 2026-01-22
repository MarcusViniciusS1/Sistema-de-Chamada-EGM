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
    private ChamadaRepository chamadaRepository;

    // --- DTOs (Data Transfer Objects) ---
    // Esses objetos servem para formatar o JSON de resposta sem causar loops infinitos

    public record DadosRotaDTO(
            Long onibusId,
            String nomeOnibus,
            String placa,
            List<ParadaComAlunosDTO> paradas
    ) {}

    public record ParadaComAlunosDTO(
            Long id,
            String nomeParada,
            String endereco,
            List<AlunoResumoDTO> alunosEsperados // <--- MUDANÇA AQUI: Usamos o Resumo, não o Aluno completo
    ) {}

    // Novo DTO simples para o Aluno (evita o erro de recursão)
    public record AlunoResumoDTO(
            Long id,
            String nomeCompleto,
            String matricula,
            String tipoAlimentar,
            String statusHoje
    ) {}

    public record StatusRotaDTO(
            Long onibusId,
            boolean concluida,
            int totalAlunos,
            int embarcaram,
            int faltaram
    ) {}

    // --- ENDPOINTS ---

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

    // 5. Status da Frota (Para o Dashboard)
    @GetMapping("/status-frota")
    public List<StatusRotaDTO> getStatusFrota() {
        LocalDate hoje = LocalDate.now();
        List<Chamada> chamadasHoje = chamadaRepository.findAllByDataChamada(hoje);

        return onibusRepository.findAll().stream().map(onibus -> {
            boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, hoje)
                    .map(RotaDiaria::isConcluida)
                    .orElse(false);

            List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());
            List<Aluno> alunosDoOnibus = paradas.stream()
                    .flatMap(p -> alunoRepository.findByParadaId(p.getId()).stream())
                    .toList();

            int total = alunosDoOnibus.size();
            int embarcaram = 0;
            int faltaram = 0;

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

    private StatusRotaDTO calcularStatusUnico(Long onibusId) {
        Onibus onibus = onibusRepository.findById(onibusId).orElseThrow();
        boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, LocalDate.now())
                .map(RotaDiaria::isConcluida)
                .orElse(false);
        return new StatusRotaDTO(onibusId, concluida, 0, 0, 0);
    }

    // --- MÉTODO CORRIGIDO PARA MONTAR A ROTA ---
    private DadosRotaDTO montarDadosRota(Onibus onibus) {
        List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());
        LocalDate hoje = LocalDate.now();

        // Buscamos todas as chamadas de hoje para preencher o status
        List<Chamada> chamadasHoje = chamadaRepository.findAllByDataChamada(hoje);

        List<ParadaComAlunosDTO> listaParadas = paradas.stream().map(parada -> {
            // Busca alunos da parada
            List<Aluno> alunos = alunoRepository.findByParadaId(parada.getId());

            // Converte Aluno (Entidade) -> AlunoResumoDTO (Simples)
            List<AlunoResumoDTO> alunosDTO = alunos.stream().map(aluno -> {

                // Verifica se já tem chamada hoje
                String status = chamadasHoje.stream()
                        .filter(c -> c.getAluno().getId().equals(aluno.getId()))
                        .findFirst()
                        .map(c -> c.getStatus().name())
                        .orElse(null);

                return new AlunoResumoDTO(
                        aluno.getId(),
                        aluno.getNomeCompleto(),
                        aluno.getMatricula(),
                        aluno.getTipoAlimentar(),
                        status
                );
            }).toList();

            return new ParadaComAlunosDTO(parada.getId(), parada.getNomeParada(), parada.getEndereco(), alunosDTO);
        }).toList();

        return new DadosRotaDTO(onibus.getId(), onibus.getNomeOnibus(), onibus.getPlaca(), listaParadas);
    }
}