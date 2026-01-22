import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Bus, Utensils, AlertTriangle, Clock, Calendar } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalOnibus: 0,
    alunosVegetarianos: 0,
    capacidadeTotal: 0
  });
  const [loading, setLoading] = useState(true);

  // Busca dados reais das APIs
  useEffect(() => {
    async function carregarDados() {
      try {
        // Tenta buscar, se der erro assume array vazio para não quebrar a tela
        const [resAlunos, resOnibus] = await Promise.all([
          axios.get('http://localhost:8080/api/alunos').catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/onibus').catch(() => ({ data: [] }))
        ]);

        const alunos = resAlunos.data || [];
        const onibus = resOnibus.data || [];

        setStats({
          totalAlunos: alunos.length,
          totalOnibus: onibus.length,
          alunosVegetarianos: alunos.filter((a: any) => a.tipoAlimentar === 'Vegetariano').length,
          capacidadeTotal: onibus.reduce((acc: number, bus: any) => acc + (bus.capacidadeMaxima || 0), 0)
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );
  }

  return (
    <div className="container-fluid" style={{maxWidth: '1200px'}}>
      
      {/* Título e Data */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0 text-white">Dashboard Geral</h3>
          <p className="text-muted small">Visão geral da operação APAE</p>
        </div>
        <div className="d-flex gap-2">
            <div className="d-flex align-items-center text-muted small bg-dark px-3 py-2 rounded-pill border border-secondary">
                <Calendar size={16} className="me-2"/> {new Date().toLocaleDateString('pt-BR')}
            </div>
            <div className="d-flex align-items-center text-muted small bg-dark px-3 py-2 rounded-pill border border-secondary">
                <Clock size={16} className="me-2"/> Atualizado agora
            </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="row g-4 mb-4">
        
        {/* Card 1: Total Alunos */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{background: '#1e293b'}}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 fw-bold small text-uppercase">Total de Alunos</p>
                  <h2 className="fw-bold mb-0 text-white">{stats.totalAlunos}</h2>
                </div>
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <Users size={24} />
                </div>
              </div>
              <div className="mt-3 text-success small fw-bold">
                 Cadastrados no sistema
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Frota */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{background: '#1e293b'}}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 fw-bold small text-uppercase">Frota Ativa</p>
                  <h2 className="fw-bold mb-0 text-white">{stats.totalOnibus}</h2>
                </div>
                <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                  <Bus size={24} />
                </div>
              </div>
              <div className="mt-3 text-muted small">
                Capacidade total: <strong className="text-white">{stats.capacidadeTotal}</strong> lugares
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Refeitório */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{background: '#1e293b'}}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 fw-bold small text-uppercase">Dietas Especiais</p>
                  <h2 className="fw-bold mb-0 text-white">{stats.alunosVegetarianos}</h2>
                </div>
                <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                  <Utensils size={24} />
                </div>
              </div>
              <div className="mt-3 text-muted small">
                Alunos vegetarianos
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Alertas */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm" style={{background: '#1e293b'}}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 fw-bold small text-uppercase">Ocorrências</p>
                  <h2 className="fw-bold mb-0 text-white">0</h2>
                </div>
                <div className="p-2 bg-danger bg-opacity-10 rounded text-danger">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div className="mt-3 text-muted small">
                Registradas hoje
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Próximas Atividades (Ocupando largura total agora) */}
      <div className="card border-0 shadow-sm" style={{background: '#1e293b'}}>
        <div className="card-header bg-transparent border-0 py-3">
            <h6 className="fw-bold mb-0 text-white">Próximas Atividades Previstas</h6>
        </div>
        <div className="list-group list-group-flush">
            <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
            <div className="bg-primary rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
            <div>
                <span className="d-block text-white">Chegada do Ônibus (Rota Centro)</span>
                <small style={{fontSize: '0.75rem'}}>Previsto: 07:45</small>
            </div>
            </div>
            <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
            <div className="bg-success rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
            <div>
                <span className="d-block text-white">Início do Almoço (Turno 1)</span>
                <small style={{fontSize: '0.75rem'}}>Início: 11:30</small>
            </div>
            </div>
            <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
            <div className="bg-warning rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
            <div>
                <span className="d-block text-white">Saída da Rota Rural</span>
                <small style={{fontSize: '0.75rem'}}>Previsto: 17:15</small>
            </div>
            </div>
        </div>
       </div>

    </div>
  );
}