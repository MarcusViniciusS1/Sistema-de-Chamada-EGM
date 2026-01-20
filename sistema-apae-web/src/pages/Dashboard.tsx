import { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, Bus, MapPin, User } from 'lucide-react';
import axios from 'axios';

// Interface para os números do topo
interface DashboardDados {
  totalAlunos: number;
  embarcaram: number;
  faltaram: number;
  aguardando: number;
}

// Interface para a lista de ônibus
interface Parada {
  nomeParada: string;
}

interface Onibus {
  id: number;
  nomeOnibus: string;
  nomeMotorista: string;
  placa: string;
  capacidadeMaxima: number;
  paradas: Parada[]; // Lista de paradas do ônibus
}

export function Dashboard() {
  // Estado dos contadores
  const [dados, setDados] = useState<DashboardDados>({
    totalAlunos: 0, embarcaram: 0, faltaram: 0, aguardando: 0
  });

  // Estado da lista de ônibus
  const [listaOnibus, setListaOnibus] = useState<Onibus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTudo();
    const intervalo = setInterval(carregarTudo, 10000); // Atualiza a cada 10s
    return () => clearInterval(intervalo);
  }, []);

  const carregarTudo = async () => {
    try {
      // 1. Busca os números do resumo
      const resResumo = await axios.get('http://localhost:8080/api/dashboard/resumo');
      setDados(resResumo.data);

      // 2. Busca a lista de ônibus cadastrados
      const resOnibus = await axios.get('http://localhost:8080/api/onibus');
      setListaOnibus(resOnibus.data);
      
    } catch (erro) {
      console.error("Erro ao buscar dados:", erro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold text-secondary">Dashboard - Sistema de Embarque</h2>
      
      {/* --- CARDS DE RESUMO (Topo) --- */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Total de Alunos</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-primary mb-0">{dados.totalAlunos}</h2>
                <Users size={32} className="text-primary opacity-50"/>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Embarcaram</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-success mb-0">{dados.embarcaram}</h2>
                <CheckCircle size={32} className="text-success opacity-50"/>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Faltaram</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-danger mb-0">{dados.faltaram}</h2>
                <AlertTriangle size={32} className="text-danger opacity-50"/>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Aguardando</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-warning mb-0">{dados.aguardando}</h2>
                <Bus size={32} className="text-warning opacity-50"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATUS DOS ÔNIBUS (Lista Dinâmica) --- */}
      <h5 className="mb-3 fw-bold text-secondary">Status dos Ônibus</h5>
      
      <div className="d-flex flex-column gap-3">
        
        {loading && <p className="text-muted">Carregando frota...</p>}
        
        {!loading && listaOnibus.length === 0 && (
          <div className="card border-0 shadow-sm">
             <div className="card-body py-5 text-center text-muted">
                <Bus size={40} className="mb-3 opacity-25"/>
                <p>Nenhum ônibus cadastrado ou em rota.</p>
             </div>
          </div>
        )}

        {listaOnibus.map((bus) => (
          <div key={bus.id} className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                
                {/* Nome e Placa */}
                <div className="col-md-4">
                  <h5 className="fw-bold text-dark mb-1">{bus.nomeOnibus}</h5>
                  <span className="badge bg-light text-secondary border">{bus.placa}</span>
                </div>

                {/* Motorista e Próxima Parada */}
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-1 text-muted small">
                    <User size={14} className="me-1"/> Motorista: <strong className="ms-1">{bus.nomeMotorista}</strong>
                  </div>
                  <div className="d-flex align-items-center text-primary small">
                    <MapPin size={14} className="me-1"/> 
                    {/* Pega a primeira parada da lista ou mostra msg padrão */}
                    Próxima: {bus.paradas.length > 0 ? bus.paradas[0].nomeParada : 'Não iniciada'}
                  </div>
                </div>

                {/* Barra de Progresso (Simulação Visual) */}
                <div className="col-md-4">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Ocupação</span>
                    <span>0/{bus.capacidadeMaxima}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: '0%' }} // Aqui futuramente ligaremos com a qtd de alunos embarcados
                    ></div>
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {bus.paradas.length} paradas na rota
                  </small>
                </div>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}