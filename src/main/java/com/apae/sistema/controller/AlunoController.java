package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.repository.AlunoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository alunoRepository;

    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Aluno> criarAluno(@RequestBody Aluno aluno) {
        return ResponseEntity.ok(alunoRepository.save(aluno));
    }

    // --- NOVOS MÉTODOS ---

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