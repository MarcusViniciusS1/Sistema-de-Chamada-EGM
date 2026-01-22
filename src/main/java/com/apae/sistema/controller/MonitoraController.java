package com.apae.sistema.controller;

import com.apae.sistema.model.*;
import com.apae.sistema.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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

    // DTOs
    public record DadosRotaDTO(Long onibusId, String nomeOnibus, String placa, List<ParadaComAlunosDTO> paradas) {}
    public record ParadaComAlunosDTO(Long id, String nomeParada, String endereco, List<Aluno> alunosEsperados) {}
    public record StatusRotaDTO(Long onibusId, boolean concluida) {}

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

    // 3. FINALIZAR ROTA (O Endpoint que estava dando erro 404)
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

    // 4. Verificar Status do Dia
    @GetMapping("/status-dia/{onibusId}")
    public StatusRotaDTO getStatusDia(@PathVariable Long onibusId) {
        Onibus onibus = onibusRepository.findById(onibusId).orElseThrow();
        boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, LocalDate.now())
                .map(RotaDiaria::isConcluida)
                .orElse(false);
        return new StatusRotaDTO(onibusId, concluida);
    }

    // 5. Status da Frota (Para o Dashboard)
    @GetMapping("/status-frota")
    public List<StatusRotaDTO> getStatusFrota() {
        LocalDate hoje = LocalDate.now();
        return onibusRepository.findAll().stream().map(onibus -> {
            boolean concluida = rotaDiariaRepository.findByOnibusAndData(onibus, hoje)
                    .map(RotaDiaria::isConcluida)
                    .orElse(false);
            return new StatusRotaDTO(onibus.getId(), concluida);
        }).collect(Collectors.toList());
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