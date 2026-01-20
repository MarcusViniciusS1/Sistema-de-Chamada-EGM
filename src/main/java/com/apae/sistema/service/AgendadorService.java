package com.apae.sistema.service;

import com.apae.sistema.model.Aluno;
import com.apae.sistema.model.Chamada;
import com.apae.sistema.model.StatusChamada;
import com.apae.sistema.repository.AlunoRepository;
import com.apae.sistema.repository.ChamadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AgendadorService {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private ChamadaRepository chamadaRepository;

    // REGRA 1: Às 08:00, quem não tem registro ganha FALTA
    // Cron: Segundos Minutos Horas Dia Mês DiaSemana
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void fecharFaltasAutomaticamente() {
        System.out.println("---- EXECUTANDO ROTINA DAS 08:00: FECHAMENTO DE FALTAS ----");
        LocalDate hoje = LocalDate.now();
        List<Aluno> todosAlunos = alunoRepository.findAll();

        for (Aluno aluno : todosAlunos) {
            // Se NÃO existe chamada para ele hoje, cria a FALTA
            if (!chamadaRepository.existsByAlunoAndDataChamada(aluno, hoje)) {
                Chamada faltaAutomatica = new Chamada();
                faltaAutomatica.setAluno(aluno);
                faltaAutomatica.setDataChamada(hoje);
                faltaAutomatica.setHoraRegistro(LocalTime.now());
                faltaAutomatica.setStatus(StatusChamada.FALTA);
                faltaAutomatica.setRegistradoPor("SISTEMA_AUTO");
                chamadaRepository.save(faltaAutomatica);
            }
        }
    }

    // REGRA 2: Às 13:00, apaga tudo de hoje para resetar para "Aguardando"
    @Scheduled(cron = "0 0 13 * * *")
    @Transactional
    public void resetarDiario() {
        System.out.println("---- EXECUTANDO ROTINA DAS 13:00: RESET DIÁRIO ----");
        // Apaga todos os registros com a data de HOJE
        chamadaRepository.deleteByDataChamada(LocalDate.now());
    }
}