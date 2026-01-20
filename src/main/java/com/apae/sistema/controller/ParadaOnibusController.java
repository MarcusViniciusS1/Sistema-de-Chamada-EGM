package com.apae.sistema.controller;

import com.apae.sistema.model.ParadaOnibus;
import com.apae.sistema.repository.ParadaOnibusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}