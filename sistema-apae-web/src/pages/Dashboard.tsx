import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CheckCircle, XCircle, Bus, MapPin, User } from 'lucide-react';

interface Onibus {
  id: number;
  nomeOnibus: string;
  placa: string;
  nomeMotorista: string;
  capacidadeMaxima: number;
}

interface Aluno {
  id: number;
  statusHoje?: string; // Vamos assumir que o backend pode mandar isso futuramente
}

export function Dashboard() {
  const [frota, setFrota] = useState<Onibus[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    embarcaram: 0,
    faltaram: 0,
    aguardando: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resOnibus, resAlunos] = await Promise.all([
        axios.get('http://localhost:8080/api/onibus').catch(() => ({ data: [] })),
        axios.get('http://localhost:8080/api/alunos').catch(() => ({ data: [] }))
      ]);

      const onibus: Onibus[] = resOnibus.data || [];
      const alunos: Aluno[] = resAlunos.data || [];

      setFrota(onibus);

      // Calculando Estatísticas (Simulação baseada nos dados)
      // Futuramente isso virá da tabela de 'chamada'
      const total = alunos.length;
      const embarcaram = 0; // Por enquanto 0, pois precisamos integrar com a chamada do dia
      const faltaram = 0;
      const aguardando = total - embarcaram - faltaram;

      setStats({ total, embarcaram, faltaram, aguardando });

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-5 text-center text-white">Carregando painel...</div>;
  }

  return (
    <div className="container-fluid" style={{ maxWidth: '1200px' }}>
      
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Dashboard - Sistema de Embarque APAE</h3>
        <p className="text-muted small">Acompanhamento em tempo real do transporte escolar</p>
      </div>

      {/* 1. CARDS DE STATUS (TOPO) */}
      <div className="row g-3 mb-4">
        
        {/* Total */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Total de Alunos</p>
                <h2 className="fw-bold text-white mb-0">{stats.total}</h2>
              </div>
              <div className="p-3 rounded bg-primary bg-opacity-10 text-primary">
                <Users size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Embarcaram */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Embarcaram</p>
                <h2 className="fw-bold text-success mb-0">{stats.embarcaram}</h2>
              </div>
              <div className="p-3 rounded bg-success bg-opacity-10 text-success">
                <CheckCircle size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Faltaram */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Faltaram</p>
                <h2 className="fw-bold text-danger mb-0">{stats.faltaram}</h2>
              </div>
              <div className="p-3 rounded bg-danger bg-opacity-10 text-danger">
                <XCircle size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Aguardando */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Aguardando</p>
                <h2 className="fw-bold text-warning mb-0">{stats.aguardando}</h2>
              </div>
              <div className="p-3 rounded bg-warning bg-opacity-10 text-warning">
                <Bus size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LISTA DE STATUS DOS ÔNIBUS */}
      <h5 className="fw-bold text-white mb-3">Status dos Ônibus</h5>
      
      <div className="d-flex flex-column gap-3">
        {frota.map((bus) => (
          <div key={bus.id} className="card border-0 shadow-sm" style={{ background: '#1e293b' }}>
            <div className="card-body">
              <div className="row align-items-center">
                
                {/* Coluna 1: Info do Ônibus */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-white mb-1">
                    <span className="text-primary me-2"><Bus size={18} style={{marginBottom: 2}}/></span>
                    {bus.nomeOnibus} <span className="text-muted small fw-normal">({bus.placa})</span>
                  </h6>
                  <div className="d-flex align-items-center mt-2 text-muted small">
                    <MapPin size={14} className="me-1" />
                    <span>Parada Atual: <strong>Garagem / Inicial</strong></span>
                  </div>
                </div>

                {/* Coluna 2: Barra de Progresso */}
                <div className="col-md-5">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Progresso da Rota</span>
                    <span className="text-white">0%</span>
                  </div>
                  <div className="progress" style={{ height: '8px', backgroundColor: '#334155' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <small className="text-muted" style={{fontSize: '0.7rem'}}>0 de 5 paradas concluídas</small>
                </div>

                {/* Coluna 3: Motorista e Lotação */}
                <div className="col-md-3 text-end border-start border-secondary border-opacity-25 ps-4">
                   <div className="mb-1">
                      <small className="text-muted d-block">Motorista</small>
                      <strong className="text-white small">{bus.nomeMotorista || 'Não definido'}</strong>
                   </div>
                   <div>
                      <small className="text-muted d-block">Alunos</small>
                      <strong className="text-white small">0 / {bus.capacidadeMaxima}</strong>
                   </div>
                </div>

              </div>
            </div>
          </div>
        ))}

        {frota.length === 0 && (
          <div className="text-center text-muted py-5 border border-secondary border-dashed rounded">
            Nenhum ônibus ativo no momento.
          </div>
        )}
      </div>

    </div>
  );
}