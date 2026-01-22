import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CheckCircle, XCircle, Bus, MapPin, Clock } from 'lucide-react';

interface Onibus { id: number; nomeOnibus: string; placa: string; nomeMotorista: string; capacidadeMaxima: number; }
interface StatusOnibus { onibusId: number; concluida: boolean; totalAlunos: number; embarcaram: number; faltaram: number; }

export function Dashboard() {
  const [frota, setFrota] = useState<Onibus[]>([]);
  const [statusFrota, setStatusFrota] = useState<StatusOnibus[]>([]);
  const [stats, setStats] = useState({ total: 0, embarcaram: 0, presentesPortaria: 0, faltaram: 0, aguardando: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, []);

  async function carregarDados() {
    try {
      const [resOnibus, resResumo, resStatus] = await Promise.all([
        axios.get('http://localhost:8080/api/onibus').catch(() => ({ data: [] })),
        axios.get('http://localhost:8080/api/dashboard/resumo').catch(() => ({ data: null })),
        axios.get('http://localhost:8080/api/monitora/status-frota').catch(() => ({ data: [] }))
      ]);

      setFrota(resOnibus.data || []);
      setStatusFrota(resStatus.data || []);

      if (resResumo.data) {
          setStats({
            total: resResumo.data.totalAlunos,
            embarcaram: resResumo.data.embarcaram,
            presentesPortaria: resResumo.data.presentesPortaria || 0,
            faltaram: resResumo.data.faltaram,
            aguardando: resResumo.data.aguardando
          });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  const totalPresentes = stats.embarcaram + stats.presentesPortaria;

  if (loading) return <div className="p-5 text-center text-white">Carregando painel...</div>;

  return (
    <div className="container-fluid" style={{ maxWidth: '1200px' }}>
      
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Dashboard - Sistema de Embarque APAE</h3>
        <p className="text-muted small">Acompanhamento em tempo real</p>
      </div>

      {/* 1. CARDS DE STATUS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Total de Alunos</p>
                <h2 className="fw-bold text-white mb-0">{stats.total}</h2>
              </div>
              <div className="p-3 rounded bg-primary bg-opacity-10 text-primary"><Users size={28} /></div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Presentes na Escola</p>
                <h2 className="fw-bold text-success mb-0">{totalPresentes}</h2>
              </div>
              <div className="p-3 rounded bg-success bg-opacity-10 text-success"><CheckCircle size={28} /></div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Faltaram</p>
                <h2 className="fw-bold text-danger mb-0">{stats.faltaram}</h2>
              </div>
              <div className="p-3 rounded bg-danger bg-opacity-10 text-danger"><XCircle size={28} /></div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: '#1e293b' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-0 fw-bold small">Aguardando</p>
                <h2 className="fw-bold text-warning mb-0">{stats.aguardando}</h2>
              </div>
              <div className="p-3 rounded bg-warning bg-opacity-10 text-warning"><Clock size={28} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LISTA DE ÔNIBUS */}
      <h5 className="fw-bold text-white mb-3">Status da Frota</h5>
      <div className="d-flex flex-column gap-3">
        {frota.map((bus) => {
          const status = statusFrota.find(s => s.onibusId === bus.id);
          const isConcluido = status?.concluida;
          
          const totalBus = status?.totalAlunos || 1;
          const processados = (status?.embarcaram || 0) + (status?.faltaram || 0);
          const progresso = isConcluido ? 100 : Math.round((processados / totalBus) * 100);

          return (
            <div key={bus.id} className="card border-0 shadow-sm" style={{ background: '#1e293b' }}>
                <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <h6 className="fw-bold text-white mb-1">
                            <span className="text-primary me-2"><Bus size={18} style={{marginBottom: 2}}/></span>
                            {bus.nomeOnibus} <span className="text-muted small fw-normal">({bus.placa})</span>
                        </h6>
                        <div className="d-flex align-items-center mt-2 text-muted small">
                            <MapPin size={14} className="me-1" />
                            <span>Status: <strong className={isConcluido ? "text-success" : "text-warning"}>
                                {isConcluido ? 'Finalizado' : 'Em Rota'}
                            </strong></span>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="d-flex justify-content-between small mb-1">
                            <span className="text-muted">Progresso</span>
                            <span className="text-white">{progresso}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px', backgroundColor: '#334155' }}>
                            <div className={`progress-bar ${isConcluido ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progresso}%` }}></div>
                        </div>
                        <small className="text-muted" style={{fontSize: '0.7rem'}}>
                            {isConcluido ? 'Rota encerrada.' : `${processados} de ${totalBus} alunos processados`}
                        </small>
                    </div>
                    <div className="col-md-3 text-end border-start border-secondary border-opacity-25 ps-4">
                        <div className="mb-1"><small className="text-muted d-block">Motorista</small><strong className="text-white small">{bus.nomeMotorista || 'ND'}</strong></div>
                        <div><small className="text-muted d-block">Presentes</small><strong className="text-white small">{status?.embarcaram || 0} / {totalBus}</strong></div>
                    </div>
                </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}