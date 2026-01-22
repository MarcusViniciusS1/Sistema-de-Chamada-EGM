package com.apae.sistema.controller;

import com.apae.sistema.model.ParadaOnibus;
import com.apae.sistema.repository.ParadaOnibusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paradas")
public class ParadaOnibusController {

    @Autowired
    private ParadaOnibusRepository repository;

    @GetMapping
    public List<ParadaOnibus> listarTodas() {
        return repository.findAll();
    }

    // LISTAR POR ÔNIBUS
    @GetMapping("/bus/{onibusId}")
    public List<ParadaOnibus> listarPorOnibus(@PathVariable Long onibusId) {
        return repository.findByOnibus_Id(onibusId);
    }

    // CRIAR NOVA PARADA
    @PostMapping
    public ParadaOnibus criar(@RequestBody ParadaOnibus parada) {
        return repository.save(parada);
    }

    // DELETAR PARADA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}