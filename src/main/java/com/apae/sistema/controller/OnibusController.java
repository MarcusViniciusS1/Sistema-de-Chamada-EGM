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
        return ResponseEntity.ok(repository.save(onibus));
    }

    // --- NOVOS MÉTODOS ---

    @PutMapping("/{id}")
    public ResponseEntity<Onibus> atualizarOnibus(@PathVariable Long id, @RequestBody Onibus onibus) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        onibus.setId(id); // Garante que atualiza o ID correto
        return ResponseEntity.ok(repository.save(onibus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarOnibus(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}