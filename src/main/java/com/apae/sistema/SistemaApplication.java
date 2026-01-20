package com.apae.sistema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // Importante

@SpringBootApplication
@EnableScheduling // <--- ADICIONE ESTA LINHA
public class SistemaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SistemaApplication.class, args);
    }
}