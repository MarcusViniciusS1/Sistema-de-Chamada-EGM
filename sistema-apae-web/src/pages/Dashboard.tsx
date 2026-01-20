import { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, Bus, MapPin, User, Trash2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

// Interface para os números do topo (Atualizada com Portaria)
interface DashboardDados {
  totalAlunos: number;
  embarcaram: number;
  faltaram: number;
  aguardando: number;
  presentesPortaria: number; // Novo campo vindo do Java
}

// Interfaces para a lista de ônibus
interface Parada {
  nomeParada: string;
}

interface Onibus {
  id: number;
  nomeOnibus: string;
  nomeMotorista: string;
  placa: string;
  capacidadeMaxima: number;
  paradas: Parada[];
}

export function Dashboard() {
  // Verifica se é ADMIN para mostrar o botão de reset
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  // Estado dos contadores
  const [dados, setDados] = useState<DashboardDados>({
    totalAlunos: 0,
    embarcaram: 0,
    faltaram: 0,
    aguardando: 0,
    presentesPortaria: 0
  });

  // Estado da lista de ônibus
  const [listaOnibus, setListaOnibus] = useState<Onibus[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os dados assim que a tela carrega e a cada 5 segundos
  useEffect(() => {
    carregarTudo();
    const intervalo = setInterval(carregarTudo, 5000); // 5 segundos para ficar bem dinâmico
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

  // Função de Reset Manual (Botão de Pânico do Admin)
  const handleReset = async () => {
    if (!window.confirm("ATENÇÃO: Isso apagará TODAS as presenças e faltas de hoje.\nTodos os alunos voltarão para 'Aguardando'.\n\nIsso é irreversível. Deseja continuar?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete('http://localhost:8080/api/chamada/reset-hoje');
      alert("Sistema resetado com sucesso! O dia começou do zero.");
      carregarTudo(); // Atualiza a tela imediatamente
    } catch (error) {
      alert("Erro ao resetar sistema. Verifique se o servidor Java está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-secondary mb-0">Dashboard</h2>
          <small className="text-muted">Visão geral do transporte e portaria</small>
        </div>
        
        {/* BOTÃO DE RESET (Só Admin vê) */}
        {isAdmin && (
          <button 
            onClick={handleReset} 
            className="btn btn-outline-danger d-flex align-items-center fw-bold btn-sm"
            title="Usar somente em caso de erro ou testes"
          >
            <Trash2 size={16} className="me-2"/> Resetar Dia
          </button>
        )}
      </div>
      
      {/* --- CARDS DE RESUMO (Topo) --- */}
      <div className="row g-3 mb-5">
        
        {/* Total */}
        <div className="col">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Total</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-primary mb-0">{dados.totalAlunos}</h2>
                <Users size={28} className="text-primary opacity-50"/>
              </div>
            </div>
          </div>
        </div>

        {/* Portaria (NOVO) */}
        <div className="col">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Na Escola</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-info mb-0">{dados.presentesPortaria}</h2>
                <ShieldCheck size={28} className="text-info opacity-50"/>
              </div>
              <small className="text-muted" style={{fontSize: '0.7rem'}}>Via Portaria</small>
            </div>
          </div>
        </div>

        {/* Embarcaram (Ônibus) */}
        <div className="col">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">No Ônibus</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-success mb-0">{dados.embarcaram}</h2>
                <CheckCircle size={28} className="text-success opacity-50"/>
              </div>
              <small className="text-muted" style={{fontSize: '0.7rem'}}>Em Trânsito</small>
            </div>
          </div>
        </div>

        {/* Faltaram */}
        <div className="col">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Faltaram</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-danger mb-0">{dados.faltaram}</h2>
                <AlertTriangle size={28} className="text-danger opacity-50"/>
              </div>
            </div>
          </div>
        </div>

        {/* Aguardando */}
        <div className="col">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Aguardando</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-warning mb-0">{dados.aguardando}</h2>
                <Bus size={28} className="text-warning opacity-50"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATUS DOS ÔNIBUS (Lista Dinâmica) --- */}
      <h5 className="mb-3 fw-bold text-secondary">Frota em Operação</h5>
      
      <div className="d-flex flex-column gap-3">
        
        {loading && <p className="text-muted">Carregando frota...</p>}
        
        {!loading && listaOnibus.length === 0 && (
          <div className="card border-0 shadow-sm">
             <div className="card-body py-5 text-center text-muted">
                <Bus size={40} className="mb-3 opacity-25"/>
                <p>Nenhum ônibus cadastrado.</p>
             </div>
          </div>
        )}

        {listaOnibus.map((bus) => (
          <div key={bus.id} className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                
                {/* Nome e Placa */}
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-light p-2 rounded-circle me-3 border">
                      <Bus className="text-secondary" size={24}/>
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{bus.nomeOnibus}</h5>
                      <span className="badge bg-light text-secondary border mt-1">{bus.placa}</span>
                    </div>
                  </div>
                </div>

                {/* Motorista e Rota */}
                <div className="col-md-4 border-start border-end">
                  <div className="px-3">
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <User size={14} className="me-2"/> Motorista: <strong className="ms-1 text-dark">{bus.nomeMotorista}</strong>
                    </div>
                    <div className="d-flex align-items-center text-primary small">
                      <MapPin size={14} className="me-2"/> 
                      Rota: {bus.paradas.length} paradas cadastradas
                    </div>
                  </div>
                </div>

                {/* Capacidade (Barra Visual) */}
                <div className="col-md-4">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span className="fw-bold">Capacidade</span>
                    <span>{bus.capacidadeMaxima} Lugares</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    {/* Barra Cinza Fixa (Placeholder visual) */}
                    <div 
                      className="progress-bar bg-secondary opacity-25" 
                      role="progressbar" 
                      style={{ width: '100%' }} 
                    ></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}