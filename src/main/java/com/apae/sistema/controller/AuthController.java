package com.apae.sistema.controller;

import com.apae.sistema.model.Usuario;
import com.apae.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

// DTO para receber os dados do login
record LoginDTO(String username, String senha) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dados) {
        // Busca o usuário pelo login
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(dados.username());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Verifica se a senha bate (Comparação simples)
            if (usuario.getSenha().equals(dados.senha())) {
                return ResponseEntity.ok(usuario); // Retorna o usuário completo (com perfil)
            }
        }

        return ResponseEntity.status(401).body("Usuário ou senha inválidos");
    }
}