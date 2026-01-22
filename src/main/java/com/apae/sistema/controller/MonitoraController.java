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

    @GetMapping("/rota-atual/{usuarioId}")
    public DadosRotaDTO getRotaAtual(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Onibus onibus = usuario.getOnibus();

        // LÓGICA DE PROTEÇÃO DO ADMIN
        // Se não tiver ônibus vinculado, mas for ADMIN, pegamos o primeiro ônibus do banco para testar
        if (onibus == null) {
            if (usuario.getPerfil().equals("ADMIN")) {
                List<Onibus> frota = onibusRepository.findAll();
                if (!frota.isEmpty()) {
                    onibus = frota.get(0); // Pega o primeiro da lista
                } else {
                    throw new RuntimeException("Nenhum ônibus cadastrado no sistema!");
                }
            } else {
                throw new RuntimeException("Monitora não vinculada a nenhum ônibus!");
            }
        }

        // Busca paradas do ônibus usando o método corrigido (com underline)
        List<ParadaOnibus> paradas = paradaRepository.findByOnibus_Id(onibus.getId());

        List<ParadaComAlunosDTO> listaParadas = paradas.stream().map(parada -> {
            List<Aluno> alunos = alunoRepository.findByParadaId(parada.getId());
            return new ParadaComAlunosDTO(parada.getId(), parada.getNomeParada(), parada.getEndereco(), alunos);
        }).toList();

        return new DadosRotaDTO(onibus.getId(), onibus.getNomeOnibus(), onibus.getPlaca(), listaParadas);
    }
}