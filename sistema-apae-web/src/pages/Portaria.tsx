import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserCheck, Clock, User, CheckCircle, Filter } from 'lucide-react';

interface Aluno {
  id: number;
  nomeCompleto: string;
  matricula: string;
  tipoAlimentar: string;
}

interface LogPortaria {
  id: number; // ID do aluno (para busca)
  alunoNome: string;
  hora: string;
  status: string;
}

export function Portaria() {
  const [termo, setTermo] = useState('');
  const [alunoEncontrado, setAlunoEncontrado] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados do Histórico
  const [logs, setLogs] = useState<LogPortaria[]>([]);
  const [filtroHistorico, setFiltroHistorico] = useState('');

  // 1. Carrega histórico ao abrir a tela
  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/chamadas/do-dia');
      setLogs(res.data);
    } catch (e) { console.error("Erro ao carregar histórico"); }
  };

  const buscarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termo) return;
    setLoading(true);
    setAlunoEncontrado(null);

    try {
      const res = await axios.get(`http://localhost:8080/api/alunos/buscar?termo=${termo}`);
      if (res.data && res.data.length > 0) {
        setAlunoEncontrado(res.data[0]);
      } else {
        alert("Aluno não encontrado.");
      }
    } catch (error) { alert("Erro ao buscar."); } 
    finally { setLoading(false); }
  };

  const registrarEntrada = async () => {
    if (!alunoEncontrado) return;
    try {
      await axios.post('http://localhost:8080/api/chamadas', {
        alunoId: alunoEncontrado.id,
        status: 'EMBARCOU' // Conta como presença
      });

      alert(`Entrada registrada: ${alunoEncontrado.nomeCompleto}`);
      
      // Limpa e atualiza histórico
      setTermo('');
      setAlunoEncontrado(null);
      carregarHistorico(); // Recarrega a lista do banco
    } catch (error) { alert("Erro ao registrar entrada."); }
  };

  // Filtragem do histórico (Nome ou ID)
  const logsFiltrados = logs.filter(log => 
    log.alunoNome.toLowerCase().includes(filtroHistorico.toLowerCase()) ||
    log.id.toString().includes(filtroHistorico)
  );

  return (
    <div className="container py-5" style={{maxWidth: '800px'}}>
      
      <div className="text-center mb-5">
        <h2 className="fw-bold text-white"><UserCheck size={40} className="me-2 text-primary"/> Controle de Portaria</h2>
        <p className="text-muted">Registro de entrada manual de alunos</p>
      </div>

      {/* CARD DE REGISTRO */}
      <div className="card bg-dark border-secondary shadow-lg mb-5">
        <div className="card-body p-4">
          
          <form onSubmit={buscarAluno} className="mb-4">
            <label className="form-label text-white">Nova Entrada</label>
            <div className="input-group input-group-lg">
              <input 
                type="text" 
                className="form-control bg-secondary border-0 text-white" 
                placeholder="Digite Nome ou Matrícula..." 
                value={termo}
                onChange={e => setTermo(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary px-4 fw-bold" type="submit" disabled={loading}>
                <Search size={24}/>
              </button>
            </div>
          </form>

          {alunoEncontrado && (
            <div className="alert alert-dark border border-primary d-flex align-items-center justify-content-between animate-fade-in">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-25 p-3 rounded-circle me-3">
                        <User size={32} className="text-white"/>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0 text-white">{alunoEncontrado.nomeCompleto}</h4>
                        <div className="text-muted">{alunoEncontrado.matricula} • {alunoEncontrado.tipoAlimentar}</div>
                    </div>
                </div>
                <button className="btn btn-success btn-lg fw-bold px-4 shadow" onClick={registrarEntrada}>
                    CONFIRMAR ENTRADA
                </button>
            </div>
          )}
        </div>
      </div>

      {/* HISTÓRICO RECENTE COM BUSCA */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <h5 className="text-white mb-0">Histórico de Hoje</h5>
        <div className="input-group input-group-sm" style={{maxWidth: '250px'}}>
            <span className="input-group-text bg-dark border-secondary text-muted"><Filter size={14}/></span>
            <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white" 
                placeholder="Buscar no histórico..."
                value={filtroHistorico}
                onChange={e => setFiltroHistorico(e.target.value)}
            />
        </div>
      </div>

      <div className="list-group shadow-sm">
        {logsFiltrados.length === 0 && (
            <div className="list-group-item bg-dark text-muted fst-italic py-4 text-center border-secondary">
                {logs.length === 0 ? "Nenhum registro hoje." : "Nenhum aluno encontrado neste filtro."}
            </div>
        )}
        
        {logsFiltrados.map((log, index) => (
            <div key={index} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-3 text-white-50">{log.hora}</span>
                    <div>
                        <strong className="d-block text-white">{log.alunoNome}</strong>
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>ID: {log.id}</small>
                    </div>
                </div>
                <div>
                    {log.status === 'EMBARCOU' || log.status === 'PRESENTE' ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                            <CheckCircle size={12} className="me-1 mb-1"/> Presente
                        </span>
                    ) : (
                        <span className="badge bg-danger">{log.status}</span>
                    )}
                </div>
            </div>
        ))}
      </div>

    </div>
  );
}