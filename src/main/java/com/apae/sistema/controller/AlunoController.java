package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.repository.AlunoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository alunoRepository;

    // CORREÇÃO: Adicionei 'idade' e 'sexo' que faltavam
    public record AlunoDTO(
            Long id,
            String nomeCompleto,
            String matricula,
            Integer idade,    // <--- Faltava isso
            String sexo,      // <--- E isso
            String tipoAlimentar,
            String enderecoResidencial,
            String nomeParada
    ) {}

    // 1. LISTAR TODOS
    @GetMapping
    public List<AlunoDTO> listar() {
        return alunoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    // 2. BUSCAR POR NOME/MATRÍCULA
    @GetMapping("/buscar")
    public List<AlunoDTO> buscar(@RequestParam String termo) {
        String termoBusca = termo.toLowerCase();
        return alunoRepository.findAll().stream()
                .filter(a -> a.getNomeCompleto().toLowerCase().contains(termoBusca) ||
                        a.getMatricula().equalsIgnoreCase(termo))
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Aluno criar(@RequestBody Aluno aluno) {
        return alunoRepository.save(aluno);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizar(@PathVariable Long id, @RequestBody Aluno dados) {
        return alunoRepository.findById(id)
                .map(aluno -> {
                    aluno.setNomeCompleto(dados.getNomeCompleto());
                    aluno.setMatricula(dados.getMatricula());
                    aluno.setIdade(dados.getIdade());
                    aluno.setSexo(dados.getSexo());
                    aluno.setTipoAlimentar(dados.getTipoAlimentar());
                    aluno.setAlergias(dados.getAlergias());
                    aluno.setDeficiencia(dados.getDeficiencia());
                    aluno.setEnderecoResidencial(dados.getEnderecoResidencial());
                    if (dados.getParada() != null) aluno.setParada(dados.getParada());
                    return ResponseEntity.ok(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (alunoRepository.existsById(id)) {
            alunoRepository.deletarHistoricoChamadas(id);
            alunoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // CONVERSOR ATUALIZADO
    private AlunoDTO converterParaDTO(Aluno aluno) {
        String nomeParada = (aluno.getParada() != null) ? aluno.getParada().getNomeParada() : "Sem Parada";

        return new AlunoDTO(
                aluno.getId(),
                aluno.getNomeCompleto(),
                aluno.getMatricula(),
                aluno.getIdade(), // <--- Mapeando a idade
                aluno.getSexo(),
                aluno.getTipoAlimentar(),
                aluno.getEnderecoResidencial(),
                nomeParada
        );
    }
}