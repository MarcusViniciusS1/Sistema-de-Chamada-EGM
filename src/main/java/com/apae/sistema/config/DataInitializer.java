package com.apae.sistema.config;

import com.apae.sistema.model.Usuario;
import com.apae.sistema.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.util.Optional;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository repository;

    @Override
    public void run(String... args) throws Exception {
        Optional<Usuario> adminExistente = repository.findByUsername("admin");

        if (adminExistente.isPresent()) {
            Usuario admin = adminExistente.get();
            admin.setNome("Administrador Principal");
            admin.setSenha("123456");
            admin.setPerfil("ADMIN");
            repository.save(admin);
            System.out.println(">>> SUCESSO: Usuário 'admin' ATUALIZADO! <<<");
        } else {
            Usuario novoAdmin = new Usuario();
            novoAdmin.setNome("Administrador Principal");
            novoAdmin.setUsername("admin");
            novoAdmin.setSenha("123456");
            novoAdmin.setPerfil("ADMIN");
            repository.save(novoAdmin);
            System.out.println(">>> SUCESSO: Usuário 'admin' CRIADO! <<<");
        }
    }
}