import { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, Bus } from 'lucide-react';
import axios from 'axios';

// Define o formato dos dados que vêm do Java
interface DashboardDados {
  totalAlunos: number;
  embarcaram: number;
  faltaram: number;
  aguardando: number;
}

export function Dashboard() {
  // Estado inicial (tudo zero enquanto carrega)
  const [dados, setDados] = useState<DashboardDados>({
    totalAlunos: 0,
    embarcaram: 0,
    faltaram: 0,
    aguardando: 0
  });

  // Busca os dados assim que a tela carrega
  useEffect(() => {
    carregarDados();
    
    // Opcional: Atualiza a cada 10 segundos automaticamente
    const intervalo = setInterval(carregarDados, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  const carregarDados = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/dashboard/resumo');
      setDados(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar dados do dashboard:", erro);
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold text-secondary">Dashboard - Sistema de Embarque</h2>
      
      {/* Cards de Status */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <h6 className="text-muted text-uppercase">Total de Alunos</h6>
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
              <h6 className="text-muted text-uppercase">Embarcaram</h6>
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
              <h6 className="text-muted text-uppercase">Faltaram</h6>
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
              <h6 className="text-muted text-uppercase">Aguardando</h6>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="fw-bold text-warning mb-0">{dados.aguardando}</h2>
                <Bus size={32} className="text-warning opacity-50"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ônibus (Exemplo visual) */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold py-3">Status dos Ônibus</div>
        <div className="card-body">
            <p className="text-muted text-center py-5">Nenhum ônibus em rota no momento.</p>
        </div>
      </div>
    </div>
  );
}