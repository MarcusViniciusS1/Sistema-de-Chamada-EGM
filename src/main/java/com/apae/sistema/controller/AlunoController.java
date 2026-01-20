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

    // Listar todos os alunos (útil para testes futuros)
    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // Criar novo aluno
    @PostMapping
    public ResponseEntity<Aluno> criarAluno(@RequestBody Aluno aluno) {
        // Aqui o Hibernate/JPA salva automaticamente no banco PostgreSQL
        Aluno novoAluno = alunoRepository.save(aluno);
        return ResponseEntity.ok(novoAluno);
    }
}