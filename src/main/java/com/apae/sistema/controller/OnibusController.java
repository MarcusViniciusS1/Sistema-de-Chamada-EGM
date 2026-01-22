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
    private OnibusRepository onibusRepository;

    // 1. LISTAR TODOS
    @GetMapping
    public List<Onibus> listar() {
        return onibusRepository.findAll();
    }

    // 2. BUSCAR POR ID (Para edição)
    @GetMapping("/{id}")
    public ResponseEntity<Onibus> buscarPorId(@PathVariable Long id) {
        return onibusRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CRIAR NOVO
    @PostMapping
    public Onibus criar(@RequestBody Onibus onibus) {
        return onibusRepository.save(onibus);
    }

    // 4. EDITAR (Atualizar)
    @PutMapping("/{id}")
    public ResponseEntity<Onibus> editar(@PathVariable Long id, @RequestBody Onibus dadosNovos) {
        return onibusRepository.findById(id)
                .map(onibus -> {
                    onibus.setNomeOnibus(dadosNovos.getNomeOnibus());
                    onibus.setPlaca(dadosNovos.getPlaca());
                    onibus.setCor(dadosNovos.getCor());
                    onibus.setNomeMotorista(dadosNovos.getNomeMotorista());
                    onibus.setCapacidadeMaxima(dadosNovos.getCapacidadeMaxima());
                    onibus.setSuportaDeficiente(dadosNovos.getSuportaDeficiente());

                    Onibus atualizado = onibusRepository.save(onibus);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. APAGAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (onibusRepository.existsById(id)) {
            onibusRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}