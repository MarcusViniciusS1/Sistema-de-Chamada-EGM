import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft, Search, User, Navigation, LayoutGrid, Eye } from 'lucide-react';

interface Aluno {
  id: number;
  nomeCompleto: string;
  matricula: string;
  tipoAlimentar: string;
  statusHoje?: 'EMBARCOU' | 'FALTA';
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

interface OnibusResumo {
  id: number;
  nomeOnibus: string;
  placa: string;
  nomeMotorista: string;
}

export function Monitora() {
  const [rota, setRota] = useState<RotaDados | null>(null);
  const [indiceParada, setIndiceParada] = useState(0); 
  const [loading, setLoading] = useState(true);

  // Estados Admin
  const [listaOnibus, setListaOnibus] = useState<OnibusResumo[]>([]);
  const [selecionandoOnibus, setSelecionandoOnibus] = useState(false);

  // Estados Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [alunoEncontrado, setAlunoEncontrado] = useState<Aluno | null>(null);
  const [motivo, setMotivo] = useState('');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  useEffect(() => {
    iniciarTela();
  }, []);

  const iniciarTela = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Se for ADMIN, busca a lista de todos os ônibus primeiro
        const res = await axios.get('http://localhost:8080/api/onibus');
        setListaOnibus(res.data);
        setSelecionandoOnibus(true); // Mostra a tela de seleção
        setLoading(false);
      } else {
        // Se for MONITOR, carrega direto a rota dele
        carregarRotaUsuario();
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const carregarRotaUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-atual/${usuarioLogado.id}`);
      setRota(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const carregarRotaOnibusEspecifico = async (onibusId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-por-onibus/${onibusId}`);
      setRota(res.data);
      setSelecionandoOnibus(false); // Esconde a seleção e mostra a rota
      setIndiceParada(0); // Reseta para a primeira parada
    } catch (error) { 
        alert("Este ônibus não possui rota cadastrada corretamente.");
    } finally { 
        setLoading(false); 
    }
  };

  const voltarParaSelecao = () => {
    setRota(null);
    setSelecionandoOnibus(true);
  };

  // ... (Funções de registro e busca mantidas iguais) ...
  const registrarEmbarque = async (alunoId: number, status: 'EMBARCOU' | 'FALTA', isForaPadrao = false, motivoTexto = '') => {
    // Simulação visual
    if (rota && !isForaPadrao) {
        const novaRota = { ...rota };
        const parada = novaRota.paradas[indiceParada];
        const alunoIndex = parada.alunosEsperados.findIndex(a => a.id === alunoId);
        if (alunoIndex >= 0) {
            parada.alunosEsperados[alunoIndex].statusHoje = status;
            setRota(novaRota);
        }
    } else if (isForaPadrao) {
        alert("Registrado (Simulação)!");
        fecharModal();
    }
  };

  const proximaParada = () => { if (rota && indiceParada < rota.paradas.length - 1) setIndiceParada(prev => prev + 1); };
  const paradaAnterior = () => { if (indiceParada > 0) setIndiceParada(prev => prev - 1); };

  const buscarAlunoForaPadrao = async () => {
    if (!termoBusca) return;
    try {
      const res = await axios.get('http://localhost:8080/api/alunos'); 
      const encontrado = res.data.find((a: Aluno) => a.nomeCompleto.toLowerCase().includes(termoBusca.toLowerCase()) || a.matricula === termoBusca);
      if (encontrado) setAlunoEncontrado(encontrado); else alert("Aluno não encontrado.");
    } catch (e) { alert("Erro ao buscar."); }
  };
  
  const fecharModal = () => { setModalAberto(false); setTermoBusca(''); setAlunoEncontrado(null); setMotivo(''); };


  // --- RENDERIZAÇÃO ---

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  // TELA 1: SELEÇÃO DE ÔNIBUS (APENAS ADMIN)
  if (isAdmin && selecionandoOnibus) {
    return (
        <div className="container py-4">
            <h3 className="text-white fw-bold mb-4 d-flex align-items-center">
                <LayoutGrid className="me-2 text-primary"/> Central de Monitoramento
            </h3>
            <div className="row g-3">
                {listaOnibus.map(bus => (
                    <div key={bus.id} className="col-md-4 col-lg-3">
                        <div className="card h-100 border-0 shadow-sm hover-scale" 
                             style={{background: '#1e293b', cursor: 'pointer'}}
                             onClick={() => carregarRotaOnibusEspecifico(bus.id)}>
                            <div className="card-body text-center p-4">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-inline-block mb-3">
                                    <Bus size={32}/>
                                </div>
                                <h5 className="text-white fw-bold mb-1">{bus.nomeOnibus}</h5>
                                <span className="badge bg-dark border border-secondary mb-3">{bus.placa}</span>
                                <p className="text-muted small mb-0">{bus.nomeMotorista || 'Sem motorista'}</p>
                                <button className="btn btn-outline-primary btn-sm w-100 mt-3">
                                    <Eye size={16} className="me-2"/> Monitorar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {listaOnibus.length === 0 && <p className="text-muted">Nenhum ônibus encontrado.</p>}
            </div>
        </div>
    );
  }

  // TELA 2: VISUALIZAÇÃO DA ROTA (IGUAL PARA ADMIN E MONITOR)
  if (!rota) return <div className="p-5 text-center text-white">Nenhuma rota encontrada.</div>;

  const paradaAtual = rota.paradas && rota.paradas.length > 0 ? rota.paradas[indiceParada] : null;

  return (
    <div className="container pb-5" style={{maxWidth: '800px'}}>
      
      {/* Botão Voltar (Apenas Admin) */}
      {isAdmin && (
          <button onClick={voltarParaSelecao} className="btn btn-link text-muted text-decoration-none mb-3 ps-0">
              <ArrowLeft size={16} className="me-1"/> Voltar para a Frota
          </button>
      )}

      {/* CABEÇALHO DO ÔNIBUS */}
      <div className="card border-0 shadow-sm mb-3" style={{background: '#1e293b'}}>
        <div className="card-body text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1"><Bus className="me-2"/> {rota.nomeOnibus}</h5>
              <small className="text-muted">{rota.placa} {isAdmin && '(Modo Admin)'}</small>
            </div>
            {paradaAtual && (
                <div className="text-end">
                <span className="badge bg-primary fs-6">{indiceParada + 1} / {rota.paradas.length}</span>
                <div className="small text-muted mt-1">Paradas</div>
                </div>
            )}
          </div>
        </div>
      </div>

      {!paradaAtual ? (
        <div className="card border-0 shadow-sm bg-dark text-white p-5 text-center">
            <Navigation size={48} className="mb-3 text-secondary"/>
            <h4>Ônibus sem paradas</h4>
            <p className="text-muted">Não há paradas cadastradas para este veículo.</p>
        </div>
      ) : (
        /* CONTROLADOR DE PARADA */
        <div className="card border-0 shadow-lg mb-4 overflow-hidden">
            <div className="card-header bg-primary text-white py-3 text-center position-relative">
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

            <div className="card-body p-0 bg-dark">
                {paradaAtual.alunosEsperados.length === 0 ? (
                    <div className="p-5 text-center text-muted">Nenhum aluno previsto aqui.</div>
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
                                            <button onClick={() => registrarEmbarque(aluno.id, 'EMBARCOU')} className="btn btn-success btn-sm fw-bold"><CheckCircle size={18}/></button>
                                            <button onClick={() => registrarEmbarque(aluno.id, 'FALTA')} className="btn btn-outline-danger btn-sm"><XCircle size={18}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="card-footer bg-secondary bg-opacity-10 p-3">
                <button className="btn btn-warning w-100 fw-bold text-dark d-flex align-items-center justify-content-center"
                onClick={() => setModalAberto(true)}>
                    <AlertTriangle size={20} className="me-2"/> Registrar Fora do Padrão
                </button>
            </div>
        </div>
      )}

      {/* MODAL (Mantido igual) */}
      {modalAberto && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning fw-bold">Embarque Extra</h5>
                <button type="button" className="btn-close btn-close-white" onClick={fecharModal}></button>
              </div>
              <div className="modal-body">
                {!alunoEncontrado ? (
                    <div className="input-group">
                        <input className="form-control bg-secondary border-0 text-white" placeholder="Nome ou Matrícula..."
                            value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                        <button className="btn btn-primary" onClick={buscarAlunoForaPadrao}><Search size={18}/></button>
                    </div>
                ) : (
                    <div>
                        <p>Aluno: <strong>{alunoEncontrado.nomeCompleto}</strong></p>
                        <input className="form-control bg-secondary border-0 text-white mb-3" placeholder="Motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />
                        <button className="btn btn-success w-100" onClick={() => registrarEmbarque(alunoEncontrado.id, 'EMBARCOU', true, motivo)}>Confirmar</button>
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