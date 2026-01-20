package com.apae.sistema.controller;

import com.apae.sistema.dto.LoginDTO;
import com.apae.sistema.dto.LoginResponseDTO;
import com.apae.sistema.model.Usuario;
import com.apae.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginDTO dados) {

        Optional<Usuario> userOpt = usuarioRepository.findByUsername(dados.username());

        if (userOpt.isPresent()) {
            Usuario usuario = userOpt.get();

            if (usuario.getSenha().equals(dados.senha())) {
                return ResponseEntity.ok(new LoginResponseDTO(
                        usuario.getId(),
                        usuario.getUsername(),
                        usuario.getPerfil(),
                        true
                ));
            }
        }

        return ResponseEntity.status(401).body(new LoginResponseDTO(null, null, null, false));
    }
}