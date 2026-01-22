package com.apae.sistema.controller;

import com.apae.sistema.model.*;
import com.apae.sistema.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // DTOs
    record DadosRotaDTO(
            Long onibusId,
            String nomeOnibus,
            String placa,
            List<ParadaComAlunosDTO> paradas
    ) {}

    record ParadaComAlunosDTO(
            Long id,
            String nomeParada,
            String endereco,
            List<Aluno> alunosEsperados
    ) {}

    // ROTA 1: Para a Monitora (Pega pelo ID do Usuário Logado)
    @GetMapping("/rota-atual/{usuarioId}")
    public DadosRotaDTO getRotaAtual(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Onibus onibus = usuario.getOnibus();

        if (onibus == null) {
            throw new RuntimeException("Usuário sem ônibus vinculado.");
        }

        return montarDadosRota(onibus);
    }

    // ROTA 2 (NOVA): Para o Admin (Pega pelo ID do Ônibus direto)
    @GetMapping("/rota-por-onibus/{onibusId}")
    public DadosRotaDTO getRotaPorOnibus(@PathVariable Long onibusId) {
        Onibus onibus = onibusRepository.findById(onibusId)
                .orElseThrow(() -> new RuntimeException("Ônibus não encontrado"));

        return montarDadosRota(onibus);
    }

    // Método auxiliar para evitar repetição de código
    private DadosRotaDTO montarDadosRota(Onibus onibus) {
        List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());

        List<ParadaComAlunosDTO> listaParadas = paradas.stream().map(parada -> {
            List<Aluno> alunos = alunoRepository.findByParadaId(parada.getId());
            return new ParadaComAlunosDTO(parada.getId(), parada.getNomeParada(), parada.getEndereco(), alunos);
        }).toList();

        return new DadosRotaDTO(onibus.getId(), onibus.getNomeOnibus(), onibus.getPlaca(), listaParadas);
    }
}