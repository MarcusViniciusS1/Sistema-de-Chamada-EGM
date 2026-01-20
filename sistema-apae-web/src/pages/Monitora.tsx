import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, Check, X, Search, User, ShieldCheck, Clock } from 'lucide-react';

// Agora usamos o DTO completo que criamos no Java
interface AlunoComStatus {
  idSequencial: number;
  nomeCompleto: string;
  matricula: string;
  enderecoResidencial: string;
  statusHoje: string; // "AGUARDANDO", "EMBARCOU", "PRESENTE_PORTARIA", "FALTA"
}

export function Monitora() {
  const [alunos, setAlunos] = useState<AlunoComStatus[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega a lista a cada 5 segundos para manter atualizado com a Portaria
  useEffect(() => {
    carregarAlunos();
    const intervalo = setInterval(carregarAlunos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const carregarAlunos = async () => {
    try {
      // Chama a nova rota que traz o status
      const res = await axios.get('http://localhost:8080/api/alunos/status-hoje');
      setAlunos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const registrar = async (id: number, status: 'EMBARCOU' | 'FALTA') => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8080/api/chamada/registrar-embarque', {
        termo: id.toString(),
        status: status
      });
      // Atualiza a lista imediatamente para refletir a mudança
      carregarAlunos();
    } catch (error) {
      alert("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(a => 
    a.nomeCompleto.toLowerCase().includes(filtro.toLowerCase()) ||
    a.matricula?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Função para renderizar o Status ou os Botões
  const renderAcoes = (aluno: AlunoComStatus) => {
    
    // 1. Se já entrou pela PORTARIA (Caso principal do seu pedido)
    if (aluno.statusHoje === 'PRESENTE_PORTARIA') {
      return (
        <span className="badge bg-primary d-flex align-items-center py-2 px-3">
          <ShieldCheck size={16} className="me-2"/> Na Escola (Portaria)
        </span>
      );
    }

    // 2. Se já EMBARCOU no ônibus
    if (aluno.statusHoje === 'EMBARCOU') {
      return (
        <span className="badge bg-success d-flex align-items-center py-2 px-3">
          <Check size={16} className="me-2"/> No Ônibus
        </span>
      );
    }

    // 3. Se FALTOU
    if (aluno.statusHoje === 'FALTA') {
      return (
        <span className="badge bg-danger d-flex align-items-center py-2 px-3">
          <X size={16} className="me-2"/> Faltou
        </span>
      );
    }

    // 4. Se está AGUARDANDO (Mostra os botões de ação)
    return (
      <div className="d-flex gap-2">
        <button 
          onClick={() => registrar(aluno.idSequencial, 'FALTA')}
          className="btn btn-outline-danger btn-sm d-flex flex-column align-items-center px-3"
          disabled={loading}
        >
          <X size={20} />
          <span style={{ fontSize: '0.7rem' }}>Falta</span>
        </button>

        <button 
          onClick={() => registrar(aluno.idSequencial, 'EMBARCOU')}
          className="btn btn-success btn-sm d-flex flex-column align-items-center px-3"
          disabled={loading}
        >
          <Bus size={20} />
          <span style={{ fontSize: '0.7rem' }}>Entrou</span>
        </button>
      </div>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      
      {/* Cabeçalho Mobile */}
      <div className="bg-primary text-white p-3 rounded-bottom shadow-sm mb-4" style={{ margin: '-1.5rem -1.5rem 1.5rem -1.5rem' }}>
        <div className="d-flex align-items-center mb-3">
          <Bus className="me-2" />
          <h5 className="mb-0 fw-bold">Lista de Embarque</h5>
        </div>
        
        <div className="input-group">
          <span className="input-group-text border-0"><Search size={18} /></span>
          <input 
            type="text" 
            className="form-control border-0" 
            placeholder="Buscar aluno por nome ou matrícula..." 
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="d-flex flex-column gap-3 pb-5">
        {alunosFiltrados.map(aluno => (
          <div key={aluno.idSequencial} className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between">
              
              <div style={{ maxWidth: '55%' }}>
                <h6 className="fw-bold mb-1 d-flex align-items-center">
                  <span className="badge bg-light text-dark border me-2 small">{aluno.matricula || '---'}</span>
                  {aluno.nomeCompleto}
                </h6>
                <small className="text-muted d-block text-truncate">
                  {aluno.enderecoResidencial}
                </small>
              </div>

              {/* Renderiza Botões ou Badge de Status */}
              <div>
                {renderAcoes(aluno)}
              </div>

            </div>
          </div>
        ))}
        {alunosFiltrados.length === 0 && (
          <p className="text-center text-muted">Nenhum aluno encontrado.</p>
        )}
      </div>
    </div>
  );
}