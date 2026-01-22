import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CheckCircle, XCircle, Bus } from 'lucide-react';

interface StatusOnibus {
    onibusId: number;
    concluida: boolean;
}

interface Onibus {
    id: number;
    nomeOnibus: string;
    placa: string;
}

export function Dashboard() {
  const [frota, setFrota] = useState<Onibus[]>([]);
  const [statusFrota, setStatusFrota] = useState<StatusOnibus[]>([]);
  const [stats, setStats] = useState({ total: 0, embarcaram: 0, faltaram: 0, aguardando: 0 });

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 10000); // Atualiza a cada 10s
    return () => clearInterval(intervalo);
  }, []);

  async function carregarDados() {
    try {
      const [resOnibus, resStatus, resResumo] = await Promise.all([
        axios.get('http://localhost:8080/api/onibus'),
        axios.get('http://localhost:8080/api/monitora/status-frota'),
        axios.get('http://localhost:8080/api/dashboard/resumo')
      ]);

      setFrota(resOnibus.data);
      setStatusFrota(resStatus.data);
      
      if(resResumo.data) {
        setStats({
            total: resResumo.data.totalAlunos,
            embarcaram: resResumo.data.embarcaram,
            faltaram: resResumo.data.faltaram,
            aguardando: resResumo.data.aguardando
        });
      }
    } catch (e) { console.error("Erro dashboard", e); }
  }

  return (
    <div className="container-fluid" style={{ maxWidth: '1200px' }}>
      
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Dashboard</h3>
        <p className="text-muted small">Monitoramento em tempo real</p>
      </div>

      {/* CARDS TOPO */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white">
                <div className="d-flex justify-content-between">
                    <div><h2 className="mb-0">{stats.total}</h2><small className="text-muted">Total Alunos</small></div>
                    <Users className="text-primary" size={28}/>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white">
                <div className="d-flex justify-content-between">
                    <div><h2 className="mb-0 text-success">{stats.embarcaram}</h2><small className="text-muted">Embarcaram</small></div>
                    <CheckCircle className="text-success" size={28}/>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white">
                <div className="d-flex justify-content-between">
                    <div><h2 className="mb-0 text-danger">{stats.faltaram}</h2><small className="text-muted">Faltaram</small></div>
                    <XCircle className="text-danger" size={28}/>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white">
                <div className="d-flex justify-content-between">
                    <div><h2 className="mb-0 text-warning">{stats.aguardando}</h2><small className="text-muted">Aguardando</small></div>
                    <Bus className="text-warning" size={28}/>
                </div>
            </div>
        </div>
      </div>

      {/* LISTA DE ÔNIBUS (VISUAL RESTAURADO) */}
      <div className="card border-0 shadow-sm bg-dark text-white">
          <div className="card-header bg-transparent border-secondary py-3">
              <h5 className="mb-0 fw-bold">Status da Frota Diária</h5>
          </div>
          <div className="list-group list-group-flush">
            {frota.length === 0 ? (
                <div className="p-4 text-center text-muted">Nenhum ônibus cadastrado.</div>
            ) : (
                frota.map(bus => {
                    const status = statusFrota.find(s => s.onibusId === bus.id);
                    const isConcluido = status?.concluida;

                    return (
                        <div key={bus.id} className="list-group-item bg-dark text-white border-secondary p-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className={`p-2 rounded me-3 ${isConcluido ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                    <Bus size={24}/>
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">{bus.nomeOnibus}</h6>
                                    <small className="text-muted">{bus.placa}</small>
                                </div>
                            </div>
                            
                            {isConcluido ? (
                                <span className="badge bg-success p-2 px-3">ROTA CONCLUÍDA</span>
                            ) : (
                                <span className="badge bg-warning text-dark p-2 px-3">EM ANDAMENTO</span>
                            )}
                        </div>
                    );
                })
            )}
          </div>
      </div>
    </div>
  );
}