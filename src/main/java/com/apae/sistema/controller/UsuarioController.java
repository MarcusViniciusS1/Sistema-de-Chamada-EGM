package com.apae.sistema.controller;

import com.apae.sistema.model.Usuario;
import com.apae.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // 1. LISTAR TODOS (Já traz o ônibus vinculado graças ao JPA)
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    // 2. BUSCAR UM (Para preencher o modal de edição)
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CRIAR USUÁRIO
    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        // O Java converte automaticamente o JSON { "onibus": { "id": 1 } } para o objeto correto
        return usuarioRepository.save(usuario);
    }

    // 4. ATUALIZAR USUÁRIO (AQUI ESTAVA O PROBLEMA PROVAVELMENTE)
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario dados) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNome(dados.getNome());
                    usuario.setUsername(dados.getUsername());
                    usuario.setPerfil(dados.getPerfil());

                    // Só troca a senha se o usuário digitou uma nova (não salva em branco)
                    if (dados.getSenha() != null && !dados.getSenha().isEmpty()) {
                        usuario.setSenha(dados.getSenha());
                    }

                    // ATUALIZAÇÃO DO VÍNCULO DO ÔNIBUS
                    // Se vier null, ele remove o vínculo. Se vier um objeto com ID, ele atualiza.
                    usuario.setOnibus(dados.getOnibus());

                    return ResponseEntity.ok(usuarioRepository.save(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}