package com.apae.sistema.controller;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.repository.AlunoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional; // Importante para o delete

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
                    // Dados Pessoais Básicos
                    aluno.setNomeCompleto(dados.getNomeCompleto());
                    aluno.setMatricula(dados.getMatricula());
                    aluno.setIdade(dados.getIdade());
                    aluno.setSexo(dados.getSexo()); // Novo campo

                    // Saúde e Alimentação
                    aluno.setTipoAlimentar(dados.getTipoAlimentar());
                    aluno.setAlergias(dados.getAlergias()); // Novo campo
                    aluno.setDeficiencia(dados.getDeficiencia()); // Novo campo

                    // Logística
                    aluno.setEnderecoResidencial(dados.getEnderecoResidencial()); // Novo campo

                    if (dados.getParada() != null) {
                        aluno.setParada(dados.getParada());
                    }

                    return ResponseEntity.ok(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (alunoRepository.existsById(id)) {
            // Usa o método corrigido com sub-select que criamos no passo anterior
            alunoRepository.deletarHistoricoChamadas(id);
            alunoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}