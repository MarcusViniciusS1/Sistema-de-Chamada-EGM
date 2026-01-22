package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.repository.AlunoRepository;
import jakarta.transaction.Transactional; // Importante para o delete funcionar
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
    public List<Aluno> listar() {
        return alunoRepository.findAll();
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
                    aluno.setTipoAlimentar(dados.getTipoAlimentar());
                    // Atualiza a parada se vier no JSON
                    if (dados.getParada() != null) {
                        aluno.setParada(dados.getParada());
                    }
                    return ResponseEntity.ok(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- CORREÇÃO AQUI ---
    @DeleteMapping("/{id}")
    @Transactional // Necessário para realizar operações de DELETE customizadas
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (alunoRepository.existsById(id)) {
            // 1. Primeiro apaga o histórico de chamadas (para não dar erro no banco)
            alunoRepository.deletarHistoricoChamadas(id);

            // 2. Depois apaga o aluno
            alunoRepository.deleteById(id);

            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}