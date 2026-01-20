package com.apae.sistema.controller;

import com.apae.sistema.model.Onibus;
import com.apae.sistema.repository.OnibusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/onibus")
public class OnibusController {

    @Autowired
    private OnibusRepository repository;

    @GetMapping
    public List<Onibus> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Onibus> criarOnibus(@RequestBody Onibus onibus) {
        Onibus novo = repository.save(onibus);
        return ResponseEntity.ok(novo);
    }
}