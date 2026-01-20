package com.apae.sistema.controller;

import com.apae.sistema.dto.AlunoComStatusDTO;
import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.repository.AlunoRepository;
import com.apae.sistema.repository.ChamadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ChamadaRepository chamadaRepository; // Injetamos o repo de chamadas

    // Listagem simples (mantida para compatibilidade)
    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // --- NOVO MÉTODO: LISTA COM STATUS EM TEMPO REAL ---
    @GetMapping("/status-hoje")
    public List<AlunoComStatusDTO> listarComStatusHoje() {
        List<Aluno> todosAlunos = alunoRepository.findAll();
        List<Chamada> chamadasHoje = chamadaRepository.findAllByDataChamada(LocalDate.now());

        // Cria um Mapa: ID do Aluno -> Status da Chamada (para busca rápida)
        Map<Long, String> mapaStatus = chamadasHoje.stream()
                .collect(Collectors.toMap(
                        c -> c.getAluno().getIdSequencial(), // Chave: ID do Aluno
                        c -> c.getStatus().name()            // Valor: Nome do Status (EMBARCOU, PRESENTE_PORTARIA...)
                ));

        // Converte a lista de alunos para o DTO, preenchendo o status
        return todosAlunos.stream()
                .map(aluno -> {
                    // Se tiver no mapa, usa o status do banco. Se não, é "AGUARDANDO"
                    String status = mapaStatus.getOrDefault(aluno.getIdSequencial(), "AGUARDANDO");
                    return AlunoComStatusDTO.from(aluno, status);
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Aluno> criarAluno(@RequestBody Aluno aluno) {
        return ResponseEntity.ok(alunoRepository.save(aluno));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizarAluno(@PathVariable Long id, @RequestBody Aluno alunoAtualizado) {
        return alunoRepository.findById(id)
                .map(aluno -> {
                    aluno.setMatricula(alunoAtualizado.getMatricula());
                    aluno.setNomeCompleto(alunoAtualizado.getNomeCompleto());
                    aluno.setIdade(alunoAtualizado.getIdade());
                    aluno.setSexo(alunoAtualizado.getSexo());
                    aluno.setTipoAlimentar(alunoAtualizado.getTipoAlimentar());
                    aluno.setEnderecoResidencial(alunoAtualizado.getEnderecoResidencial());
                    aluno.setParadaId(alunoAtualizado.getParadaId());
                    aluno.setAlergias(alunoAtualizado.getAlergias());
                    aluno.setDeficiencia(alunoAtualizado.getDeficiencia());
                    return ResponseEntity.ok(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAluno(@PathVariable Long id) {
        if (alunoRepository.existsById(id)) {
            alunoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}