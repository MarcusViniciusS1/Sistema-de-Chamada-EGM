import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft, Search, User, Navigation } from 'lucide-react';

interface Aluno {
  id: number;
  nomeCompleto: string;
  matricula: string;
  tipoAlimentar: string;
  fotoUrl?: string;
  statusHoje?: 'EMBARCOU' | 'FALTA' | 'PENDENTE';
}

interface Parada {
  id: number;
  nomeParada: string;
  endereco: string;
  alunosEsperados: Aluno[];
}

interface RotaDados {
  nomeOnibus: string;
  placa: string;
  paradas: Parada[];
}

export function Monitora() {
  const [rota, setRota] = useState<RotaDados | null>(null);
  const [indiceParada, setIndiceParada] = useState(0); 
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [alunoEncontrado, setAlunoEncontrado] = useState<Aluno | null>(null);
  const [motivo, setMotivo] = useState('');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');

  useEffect(() => {
    carregarRota();
  }, []);

  const carregarRota = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-atual/${usuarioLogado.id}`);
      setRota(res.data);
    } catch (error) {
      console.error("Erro ao carregar rota", error);
    } finally {
      setLoading(false);
    }
  };

  const registrarEmbarque = async (alunoId: number, status: 'EMBARCOU' | 'FALTA', isForaPadrao = false, motivoTexto = '') => {
    try {
      // Simulação de chamada ao backend (pode ajustar a URL conforme seu controller de chamada)
      // await axios.post('http://localhost:8080/api/chamada', ...);

      // Atualiza visualmente para feedback rápido
      if (rota && !isForaPadrao) {
        const novaRota = { ...rota };
        const parada = novaRota.paradas[indiceParada];
        
        // Encontra o aluno na lista da parada atual
        const alunoIndex = parada.alunosEsperados.findIndex(a => a.id === alunoId);
        
        if (alunoIndex >= 0) {
            parada.alunosEsperados[alunoIndex].statusHoje = status;
            setRota(novaRota);
        }
      } else if (isForaPadrao) {
        alert("Aluno fora do padrão registrado (Simulação)!");
        fecharModal();
      }
    } catch (error) {
      alert("Erro ao registrar.");
    }
  };

  const proximaParada = () => {
    if (rota && indiceParada < rota.paradas.length - 1) {
      setIndiceParada(prev => prev + 1);
    }
  };

  const paradaAnterior = () => {
    if (indiceParada > 0) {
      setIndiceParada(prev => prev - 1);
    }
  };

  const buscarAlunoForaPadrao = async () => {
    if (!termoBusca) return;
    try {
      // Busca geral de alunos (simulação filtrando no front se necessário, ou rota específica)
      const res = await axios.get('http://localhost:8080/api/alunos'); 
      const encontrado = res.data.find((a: Aluno) => 
        a.nomeCompleto.toLowerCase().includes(termoBusca.toLowerCase()) || 
        a.matricula === termoBusca
      );
      
      if (encontrado) setAlunoEncontrado(encontrado);
      else alert("Aluno não encontrado.");
      
    } catch (e) { alert("Erro ao buscar."); }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTermoBusca('');
    setAlunoEncontrado(null);
    setMotivo('');
  };

  // --- TRATAMENTO DE ESTADOS DE ERRO/CARREGAMENTO ---

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (!rota) return (
    <div className="p-5 text-center text-white">
        <AlertTriangle size={48} className="mb-3 text-warning"/>
        <h4>Nenhuma rota encontrada</h4>
        <p className="text-muted">Verifique se você está vinculado a um ônibus.</p>
    </div>
  );

  // AQUI ESTAVA O ERRO: Se a lista de paradas vier vazia, paradaAtual seria undefined
  if (!rota.paradas || rota.paradas.length === 0) {
    return (
        <div className="container p-4" style={{maxWidth: '800px'}}>
             <div className="card border-0 shadow-sm bg-dark text-white">
                <div className="card-body text-center p-5">
                    <Navigation size={48} className="mb-3 text-secondary"/>
                    <h4>Ônibus sem paradas</h4>
                    <p className="text-muted">O ônibus "{rota.nomeOnibus}" não possui paradas cadastradas.</p>
                </div>
             </div>
        </div>
    );
  }

  const paradaAtual = rota.paradas[indiceParada];

  return (
    <div className="container pb-5" style={{maxWidth: '800px'}}>
      
      {/* CABEÇALHO DO ÔNIBUS */}
      <div className="card border-0 shadow-sm mb-3" style={{background: '#1e293b'}}>
        <div className="card-body text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1"><Bus className="me-2"/> {rota.nomeOnibus}</h5>
              <small className="text-muted">{rota.placa} | Monitora: {usuarioLogado.nome}</small>
            </div>
            <div className="text-end">
              <span className="badge bg-primary fs-6">{indiceParada + 1} / {rota.paradas.length}</span>
              <div className="small text-muted mt-1">Paradas</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLADOR DE PARADA */}
      <div className="card border-0 shadow-lg mb-4 overflow-hidden">
        <div className="card-header bg-primary text-white py-3 text-center position-relative">
            {/* Setas de Navegação */}
            <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                <button className="btn btn-sm btn-light bg-opacity-25 border-0 text-white" 
                   onClick={paradaAnterior} disabled={indiceParada === 0}>
                   <ArrowLeft size={24}/>
                </button>
            </div>

            <h4 className="fw-bold mb-0">{paradaAtual.nomeParada}</h4>
            <small className="opacity-75"><MapPin size={14} className="me-1"/>{paradaAtual.endereco}</small>
            
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                <button className="btn btn-sm btn-light bg-opacity-25 border-0 text-white" 
                   onClick={proximaParada} disabled={indiceParada === rota.paradas.length - 1}>
                   <ArrowRight size={24}/>
                </button>
            </div>
        </div>

        {/* LISTA DE ALUNOS DA PARADA */}
        <div className="card-body p-0 bg-dark">
            {paradaAtual.alunosEsperados.length === 0 ? (
                <div className="p-5 text-center text-muted">Nenhum aluno previsto para descer/subir aqui.</div>
            ) : (
                <div className="list-group list-group-flush">
                    {paradaAtual.alunosEsperados.map(aluno => (
                        <div key={aluno.id} className="list-group-item bg-dark text-white border-secondary p-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold mb-0">{aluno.nomeCompleto}</h6>
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                    {aluno.matricula} • {aluno.tipoAlimentar}
                                </small>
                            </div>
                            
                            <div className="d-flex gap-2">
                                {aluno.statusHoje ? (
                                    <span className={`badge ${aluno.statusHoje === 'EMBARCOU' ? 'bg-success' : 'bg-danger'} p-2`}>
                                        {aluno.statusHoje}
                                    </span>
                                ) : (
                                    <>
                                        <button onClick={() => registrarEmbarque(aluno.id, 'EMBARCOU')} className="btn btn-success btn-sm fw-bold">
                                            <CheckCircle size={18}/> Embarcou
                                        </button>
                                        <button onClick={() => registrarEmbarque(aluno.id, 'FALTA')} className="btn btn-outline-danger btn-sm">
                                            <XCircle size={18}/>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* RODAPÉ */}
        <div className="card-footer bg-secondary bg-opacity-10 p-3">
            <button className="btn btn-warning w-100 fw-bold text-dark d-flex align-items-center justify-content-center"
               onClick={() => setModalAberto(true)}>
                <AlertTriangle size={20} className="me-2"/> Registrar Aluno Fora do Padrão
            </button>
        </div>
      </div>

      {/* MODAL FORA DO PADRÃO */}
      {modalAberto && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning fw-bold">
                    <AlertTriangle className="me-2"/> Embarque Extra
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={fecharModal}></button>
              </div>
              <div className="modal-body">
                {!alunoEncontrado ? (
                    <div className="mb-3">
                        <label className="form-label">Buscar Aluno</label>
                        <div className="input-group">
                            <input type="text" className="form-control bg-secondary border-0 text-white" 
                                placeholder="Nome ou Matrícula..."
                                value={termoBusca}
                                onChange={e => setTermoBusca(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={buscarAlunoForaPadrao}>
                                <Search size={18}/>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="alert alert-info bg-opacity-10 border-0 text-info mb-3">
                             <strong>Aluno:</strong> {alunoEncontrado.nomeCompleto}
                             <button className="btn btn-sm btn-link float-end p-0 text-info" onClick={() => setAlunoEncontrado(null)}>Trocar</button>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Motivo</label>
                            <input className="form-control bg-secondary border-0 text-white" 
                                placeholder="Ex: Mudou de parada hoje..."
                                value={motivo} onChange={e => setMotivo(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-success w-100" onClick={() => registrarEmbarque(alunoEncontrado.id, 'EMBARCOU', true, motivo)}>
                            Confirmar
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  ); 
}