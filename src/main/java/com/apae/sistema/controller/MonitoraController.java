package com.apae.sistema.controller;

import com.apae.sistema.dto.MonitoraDTO;
import com.apae.sistema.model.Monitora;
import com.apae.sistema.model.Usuario;
import com.apae.sistema.repository.MonitoraRepository;
import com.apae.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitoras")
public class MonitoraController {

    @Autowired
    private MonitoraRepository monitoraRepository;

    @Autowired
    private UsuarioRepository usuarioRepository; // Para verificar duplicidade de login

    // Listar todas convertendo para DTO
    @GetMapping
    public List<MonitoraDTO> listar() {
        return monitoraRepository.findAll().stream().map(m -> new MonitoraDTO(
                m.getId(), m.getNome(), m.getTelefone(), m.getEndereco(), m.getCpf(),
                m.getUsuario().getUsername(), "******" // Não devolvemos a senha por segurança
        )).collect(Collectors.toList());
    }

    // Criar Nova Monitora + Usuário
    @PostMapping
    @Transactional
    public ResponseEntity<?> criar(@RequestBody MonitoraDTO dados) {
        // Verifica se o usuário já existe
        /*if (usuarioRepository.findByUsername(dados.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Usuário de login já existe!");
        }*/
        // Nota: Se não tiver o método findByUsername no UsuarioRepository, pule a verificação ou adicione lá.

        // 1. Cria o Usuário de Acesso
        Usuario novoUsuario = new Usuario();
        novoUsuario.setUsername(dados.username());
        novoUsuario.setSenha(dados.senha());
        novoUsuario.setPerfil("MONITORA"); // Perfil fixo

        // 2. Cria a Monitora vinculada
        Monitora novaMonitora = new Monitora();
        novaMonitora.setNome(dados.nome());
        novaMonitora.setTelefone(dados.telefone());
        novaMonitora.setEndereco(dados.endereco());
        novaMonitora.setCpf(dados.cpf());
        novaMonitora.setUsuario(novoUsuario); // Vincula

        monitoraRepository.save(novaMonitora);
        return ResponseEntity.ok("Monitora cadastrada com sucesso!");
    }

    // Deletar (Apaga o usuário junto)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        monitoraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}