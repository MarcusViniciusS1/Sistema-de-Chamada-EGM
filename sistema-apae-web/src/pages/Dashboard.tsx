import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CheckCircle, XCircle, Bus, Clock } from 'lucide-react';

// ATUALIZADO: Interface agora tem os números
interface StatusOnibus {
    onibusId: number;
    concluida: boolean;
    totalAlunos: number;
    embarcaram: number;
    faltaram: number;
}

interface Onibus {
    id: number;
    nomeOnibus: string;
    placa: string;
}

export function Dashboard() {
  const [frota, setFrota] = useState<Onibus[]>([]);
  const [statusFrota, setStatusFrota] = useState<StatusOnibus[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    embarcaram: 0, 
    presentesPortaria: 0,
    faltaram: 0, 
    aguardando: 0 
  });

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 5000); 
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
            presentesPortaria: resResumo.data.presentesPortaria || 0,
            faltaram: resResumo.data.faltaram,
            aguardando: resResumo.data.aguardando
        });
      }
    } catch (e) { console.error("Erro dashboard", e); }
  }

  const totalPresentes = stats.embarcaram + stats.presentesPortaria;

  return (
    <div className="container-fluid" style={{ maxWidth: '1200px' }}>
      
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1">Visão Geral</h3>
        <p className="text-muted small">Acompanhamento de alunos e transporte</p>
      </div>

      {/* --- CARDS DE ESTATÍSTICAS (MANTIDOS IGUAIS) --- */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="mb-0 fw-bold">{stats.total}</h2>
                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Total de Alunos</small>
                    </div>
                    <div className="p-3 bg-primary bg-opacity-10 rounded text-primary"><Users size={24}/></div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="mb-0 fw-bold text-success">{totalPresentes}</h2>
                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Alunos Presentes</small>
                    </div>
                    <div className="p-3 bg-success bg-opacity-10 rounded text-success"><CheckCircle size={24}/></div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="mb-0 fw-bold text-danger">{stats.faltaram}</h2>
                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Faltas Registradas</small>
                    </div>
                    <div className="p-3 bg-danger bg-opacity-10 rounded text-danger"><XCircle size={24}/></div>
                </div>
            </div>
        </div>
        <div className="col-md-3">
            <div className="card bg-dark border-0 shadow-sm p-3 text-white h-100">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="mb-0 fw-bold text-warning">{stats.aguardando}</h2>
                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Aguardando Check-in</small>
                    </div>
                    <div className="p-3 bg-warning bg-opacity-10 rounded text-warning"><Clock size={24}/></div>
                </div>
            </div>
        </div>
      </div>

      {/* --- LISTA DE ÔNIBUS COM DETALHES --- */}
      <div className="card border-0 shadow-sm bg-dark text-white">
          <div className="card-header bg-transparent border-secondary py-3">
              <h5 className="mb-0 fw-bold"><Bus className="me-2 text-primary" size={20}/> Detalhes da Frota</h5>
          </div>
          <div className="list-group list-group-flush">
            {frota.length === 0 ? (
                <div className="p-5 text-center text-muted">Nenhum ônibus cadastrado no sistema.</div>
            ) : (
                frota.map(bus => {
                    const status = statusFrota.find(s => s.onibusId === bus.id);
                    const isConcluido = status?.concluida;
                    
                    // Dados individuais deste ônibus
                    const totalBus = status?.totalAlunos || 0;
                    const embarcadosBus = status?.embarcaram || 0;
                    const faltasBus = status?.faltaram || 0;
                    const aguardandoBus = totalBus - embarcadosBus - faltasBus;

                    // Cálculo da porcentagem para barra de progresso
                    const processados = embarcadosBus + faltasBus;
                    const percentual = totalBus > 0 ? (processados / totalBus) * 100 : 0;

                    return (
                        <div key={bus.id} className="list-group-item bg-dark text-white border-secondary p-4">
                            <div className="row align-items-center">
                                {/* Nome e Ícone */}
                                <div className="col-md-4 mb-3 mb-md-0 d-flex align-items-center">
                                    <div className={`p-3 rounded-circle me-3 ${isConcluido ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                        <Bus size={24}/>
                                    </div>
                                    <div>
                                        <h5 className="mb-0 fw-bold">{bus.nomeOnibus}</h5>
                                        <small className="text-muted">{bus.placa}</small>
                                    </div>
                                </div>

                                {/* Status e Barra de Progresso */}
                                <div className="col-md-5 mb-3 mb-md-0">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">
                                            {isConcluido ? 'Finalizado' : 'Em andamento'}
                                        </span>
                                        <span className="text-white">
                                            {processados} / {totalBus} alunos processados
                                        </span>
                                    </div>
                                    <div className="progress" style={{height: '6px', backgroundColor: '#334155'}}>
                                        <div 
                                            className={`progress-bar ${isConcluido ? 'bg-success' : 'bg-primary'}`} 
                                            role="progressbar" 
                                            style={{width: `${percentual}%`}}
                                        ></div>
                                    </div>
                                    <div className="mt-2 d-flex gap-3 small">
                                        <span className="text-success"><CheckCircle size={12} className="me-1"/>{embarcadosBus} presentes</span>
                                        <span className="text-danger"><XCircle size={12} className="me-1"/>{faltasBus} faltas</span>
                                        {aguardandoBus > 0 && <span className="text-warning"><Clock size={12} className="me-1"/>{aguardandoBus} aguardando</span>}
                                    </div>
                                </div>
                                
                                {/* Badge Final */}
                                <div className="col-md-3 text-end">
                                    {isConcluido ? (
                                        <span className="badge bg-success p-2 px-3">ROTA CONCLUÍDA</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark p-2 px-3">EM ANDAMENTO</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
          </div>
      </div>
    </div>
  );
}