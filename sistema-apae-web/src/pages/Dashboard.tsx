import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Bus, Utensils, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes do gráfico
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Dashboard() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalOnibus: 0,
    alunosVegetarianos: 0,
    capacidadeTotal: 0
  });
  const [loading, setLoading] = useState(true);

  // Busca dados reais das APIs existentes
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAlunos, resOnibus] = await Promise.all([
          axios.get('http://localhost:8080/api/alunos'),
          axios.get('http://localhost:8080/api/onibus')
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

  // Dados do Gráfico (Mock visual para exemplo)
  const dataGrafico = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    datasets: [
      {
        label: 'Presença de Alunos',
        data: [12, 19, 15, 17, stats.totalAlunos], // Exemplo dinâmico
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Azul primary
        borderRadius: 4,
      },
    ],
  };

  const optionsGrafico = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#334155' }, 
        ticks: { color: '#94a3b8' } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8' } 
      }
    }
  };

  if (loading) {
    return <div className="p-5 text-center text-muted">Carregando indicadores...</div>;
  }

  return (
    <div className="container-fluid" style={{maxWidth: '1200px'}}>
      
      {/* Título */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0 text-white">Dashboard Geral</h3>
          <p className="text-muted small">Visão geral da operação APAE</p>
        </div>
        <div className="d-flex align-items-center text-muted small bg-dark px-3 py-2 rounded-pill border border-secondary">
          <Clock size={16} className="me-2"/> Atualizado agora
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="row g-4 mb-4">
        
        {/* Card 1: Total Alunos */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden">
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
              <div className="mt-3">
                <span className="badge bg-success bg-opacity-25 text-success">
                  <TrendingUp size={12} className="me-1"/> +2 novos
                </span>
                <span className="text-muted small ms-2">este mês</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Frota */}
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
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
          <div className="card h-100 border-0 shadow-sm">
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
          <div className="card h-100 border-0 shadow-sm">
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
                Hoje
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="row g-4">
        
        {/* Gráfico de Presença */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h6 className="fw-bold mb-0 text-white">Histórico de Presença (Semanal)</h6>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={dataGrafico} options={optionsGrafico} />
              </div>
            </div>
          </div>
        </div>

        {/* Lista Rápida */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h6 className="fw-bold mb-0 text-white">Próximas Atividades</h6>
            </div>
            <div className="list-group list-group-flush">
              <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
                <div className="bg-primary rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
                <div>
                  <span className="d-block text-white">Chegada Ônibus Amarelo</span>
                  <small style={{fontSize: '0.75rem'}}>Previsto: 07:45</small>
                </div>
              </div>
              <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
                <div className="bg-success rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
                <div>
                  <span className="d-block text-white">Almoço Turno 1</span>
                  <small style={{fontSize: '0.75rem'}}>Início: 11:30</small>
                </div>
              </div>
              <div className="list-group-item bg-transparent text-muted border-secondary d-flex align-items-center py-3">
                <div className="bg-warning rounded-circle p-1 me-3" style={{width: 10, height: 10}}></div>
                <div>
                  <span className="d-block text-white">Saída Rota Rural</span>
                  <small style={{fontSize: '0.75rem'}}>Previsto: 17:15</small>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}