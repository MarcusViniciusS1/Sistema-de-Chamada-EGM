package com.apae.sistema.controller;

import com.apae.sistema.dto.PortariaDTO;
import com.apae.sistema.model.*;
import com.apae.sistema.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chamada")
public class ChamadaController {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ChamadaRepository chamadaRepository;

    // --- ROTA 1: PORTARIA (Entrada na escola) ---
    @PostMapping("/registrar-portaria")
    public ResponseEntity<PortariaDTO> registrarPresenca(@RequestBody PortariaDTO dados) {
        String termo = dados.termo();
        LocalDate hoje = LocalDate.now();
        LocalTime agora = LocalTime.now();

        // 1. Tenta achar o aluno (primeiro por Matrícula, depois por Nome)
        Optional<Aluno> alunoOpt = alunoRepository.findByMatricula(termo);
        if (alunoOpt.isEmpty()) {
            alunoOpt = alunoRepository.findByNomeCompletoIgnoreCase(termo);
        }

        if (alunoOpt.isEmpty()) {
            return ResponseEntity.ok(new PortariaDTO(termo, "ERRO", "Aluno não encontrado.", null, null));
        }

        Aluno aluno = alunoOpt.get();

        // 2. VERIFICAÇÃO DE DUPLICIDADE
        if (chamadaRepository.existsByAlunoAndDataChamada(aluno, hoje)) {
            return ResponseEntity.ok(new PortariaDTO(
                    termo,
                    "DUPLICADO",
                    "Aluno já está presente hoje.",
                    aluno.getNomeCompleto(),
                    null
            ));
        }

        // 3. Salva a presença
        Chamada novaChamada = new Chamada();
        novaChamada.setAluno(aluno);
        novaChamada.setDataChamada(hoje);
        novaChamada.setHoraRegistro(agora);
        novaChamada.setStatus(StatusChamada.PRESENTE_PORTARIA);
        novaChamada.setRegistradoPor("PORTARIA");

        chamadaRepository.save(novaChamada);

        return ResponseEntity.ok(new PortariaDTO(
                termo,
                "SUCESSO",
                "Entrada registrada com sucesso!",
                aluno.getNomeCompleto(),
                agora.format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        ));
    }

    // --- ROTA 2: MONITORA (Embarque no Ônibus) ---
    @PostMapping("/registrar-embarque")
    public ResponseEntity<PortariaDTO> registrarEmbarque(@RequestBody PortariaDTO dados) {
        String idAlunoStr = dados.termo();
        LocalDate hoje = LocalDate.now();

        Long id = Long.parseLong(idAlunoStr);
        Optional<Aluno> alunoOpt = alunoRepository.findById(id);

        if (alunoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new PortariaDTO(idAlunoStr, "ERRO", "Aluno não encontrado", null, null));
        }
        Aluno aluno = alunoOpt.get();

        StatusChamada novoStatus = dados.status().equals("FALTA") ? StatusChamada.FALTA : StatusChamada.EMBARCOU;

        // Verifica se JÁ existe registro hoje para atualizar em vez de criar novo
        Chamada chamadaExistente = chamadaRepository.findByAlunoAndDataChamada(aluno, hoje);

        if (chamadaExistente != null) {
            chamadaExistente.setStatus(novoStatus);
            chamadaExistente.setHoraRegistro(LocalTime.now());
            chamadaExistente.setRegistradoPor("MONITORA_UPD");
            chamadaRepository.save(chamadaExistente);
        } else {
            Chamada novaChamada = new Chamada();
            novaChamada.setAluno(aluno);
            novaChamada.setDataChamada(hoje);
            novaChamada.setHoraRegistro(LocalTime.now());
            novaChamada.setStatus(novoStatus);
            novaChamada.setRegistradoPor("MONITORA");
            chamadaRepository.save(novaChamada);
        }

        return ResponseEntity.ok(new PortariaDTO(
                idAlunoStr,
                "SUCESSO",
                "Status atualizado: " + novoStatus,
                aluno.getNomeCompleto(),
                LocalTime.now().toString()
        ));
    }

    // --- ROTA 3: RESET MANUAL (ADMIN) ---
    @DeleteMapping("/reset-hoje")
    @Transactional
    public ResponseEntity<Void> resetarTudoHoje() {
        chamadaRepository.deleteByDataChamada(LocalDate.now());
        return ResponseEntity.noContent().build();
    }

    // --- ROTA 4: HISTÓRICO DA PORTARIA (NOVO) ---
    @GetMapping("/historico-portaria")
    public List<PortariaDTO> getHistoricoPortaria() {
        LocalDate hoje = LocalDate.now();

        // Busca no banco tudo que foi registrado pela "PORTARIA" hoje
        List<Chamada> lista = chamadaRepository.findByDataChamadaAndRegistradoPorOrderByHoraRegistroDesc(hoje, "PORTARIA");

        return lista.stream().map(c -> new PortariaDTO(
                c.getAluno().getMatricula(),
                "SUCESSO",
                "Registro recuperado",
                c.getAluno().getNomeCompleto(),
                c.getHoraRegistro().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        )).collect(Collectors.toList());
    }
}