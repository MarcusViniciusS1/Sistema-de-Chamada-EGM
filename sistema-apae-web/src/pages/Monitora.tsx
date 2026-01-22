import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft, Search, Navigation, LayoutGrid, Eye } from 'lucide-react';

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
        const res = await axios.get('http://localhost:8080/api/onibus');
        setListaOnibus(res.data);
        setSelecionandoOnibus(true);
        setLoading(false);
      } else {
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
      setSelecionandoOnibus(false);
      setIndiceParada(0);
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

  const registrarEmbarque = async (alunoId: number, status: 'EMBARCOU' | 'FALTA', isForaPadrao = false, motivoTexto = '') => {
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


  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  // TELA 1: SELEÇÃO DE ÔNIBUS (FONTE AUMENTADA NOS CARDS)
  if (isAdmin && selecionandoOnibus) {
    return (
        <div className="container py-4">
            <h3 className="text-white fw-bold mb-4 d-flex align-items-center" style={{fontSize: '1.75rem'}}>
                <LayoutGrid className="me-2 text-primary" size={32}/> Central de Monitoramento
            </h3>
            <div className="row g-3">
                {listaOnibus.map(bus => (
                    <div key={bus.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm hover-scale" 
                             style={{background: '#1e293b', cursor: 'pointer'}}
                             onClick={() => carregarRotaOnibusEspecifico(bus.id)}>
                            <div className="card-body text-center p-4">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-inline-block mb-3">
                                    <Bus size={40}/>
                                </div>
                                <h4 className="text-white fw-bold mb-2">{bus.nomeOnibus}</h4>
                                <span className="badge bg-dark border border-secondary mb-3 fs-6 px-3 py-2">{bus.placa}</span>
                                <p className="text-muted mb-0 fs-5">{bus.nomeMotorista || 'Sem motorista'}</p>
                                <button className="btn btn-outline-primary w-100 mt-4 fw-bold fs-6">
                                    <Eye size={20} className="me-2"/> Monitorar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (!rota) return <div className="p-5 text-center text-white">Nenhuma rota encontrada.</div>;

  const paradaAtual = rota.paradas && rota.paradas.length > 0 ? rota.paradas[indiceParada] : null;

  return (
    <div className="container pb-5" style={{maxWidth: '900px'}}>
      
      {isAdmin && (
          <button onClick={voltarParaSelecao} className="btn btn-link text-muted text-decoration-none mb-3 ps-0 fs-6">
              <ArrowLeft size={20} className="me-1"/> Voltar para a Frota
          </button>
      )}

      {/* CABEÇALHO DO ÔNIBUS */}
      <div className="card border-0 shadow-sm mb-3" style={{background: '#1e293b'}}>
        <div className="card-body text-white py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="fw-bold mb-1"><Bus className="me-2" size={28}/> {rota.nomeOnibus}</h3>
              <div className="text-muted fs-5">{rota.placa} {isAdmin && '(Modo Admin)'}</div>
            </div>
            {paradaAtual && (
                <div className="text-end">
                <span className="badge bg-primary fs-5 px-3 py-2">{indiceParada + 1} / {rota.paradas.length}</span>
                <div className="small text-muted mt-1">Paradas</div>
                </div>
            )}
          </div>
        </div>
      </div>

      {!paradaAtual ? (
        <div className="card border-0 shadow-sm bg-dark text-white p-5 text-center">
            <Navigation size={64} className="mb-3 text-secondary"/>
            <h3>Ônibus sem paradas</h3>
            <p className="text-muted fs-5">Não há paradas cadastradas para este veículo.</p>
        </div>
      ) : (
        /* CONTROLADOR DE PARADA */
        <div className="card border-0 shadow-lg mb-4 overflow-hidden">
            <div className="card-header bg-primary text-white py-4 text-center position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <button className="btn btn-lg btn-light bg-opacity-25 border-0 text-white p-3" 
                    onClick={paradaAnterior} disabled={indiceParada === 0}>
                    <ArrowLeft size={32}/>
                    </button>
                </div>

                {/* AUMENTO DA FONTE AQUI */}
                <h2 className="fw-bold mb-1">{paradaAtual.nomeParada}</h2>
                <div className="opacity-75 fs-5"><MapPin size={18} className="me-1"/>{paradaAtual.endereco}</div>
                
                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <button className="btn btn-lg btn-light bg-opacity-25 border-0 text-white p-3" 
                    onClick={proximaParada} disabled={indiceParada === rota.paradas.length - 1}>
                    <ArrowRight size={32}/>
                    </button>
                </div>
            </div>

            <div className="card-body p-0 bg-dark">
                {paradaAtual.alunosEsperados.length === 0 ? (
                    <div className="p-5 text-center text-muted fs-5">Nenhum aluno previsto aqui.</div>
                ) : (
                    <div className="list-group list-group-flush">
                        {paradaAtual.alunosEsperados.map(aluno => (
                            <div key={aluno.id} className="list-group-item bg-dark text-white border-secondary p-4 d-flex justify-content-between align-items-center">
                                <div>
                                    {/* AUMENTO DA FONTE DO NOME E DETALHES */}
                                    <h5 className="fw-bold mb-1 fs-4">{aluno.nomeCompleto}</h5>
                                    <div className="text-muted fs-6">
                                        {aluno.matricula} • <span className="text-warning">{aluno.tipoAlimentar}</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    {aluno.statusHoje ? (
                                        <span className={`badge ${aluno.statusHoje === 'EMBARCOU' ? 'bg-success' : 'bg-danger'} fs-6 p-2 px-3`}>
                                            {aluno.statusHoje}
                                        </span>
                                    ) : (
                                        <>
                                            <button onClick={() => registrarEmbarque(aluno.id, 'EMBARCOU')} className="btn btn-success btn-lg fw-bold px-4">
                                                <CheckCircle size={24}/>
                                            </button>
                                            <button onClick={() => registrarEmbarque(aluno.id, 'FALTA')} className="btn btn-outline-danger btn-lg px-4">
                                                <XCircle size={24}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="card-footer bg-secondary bg-opacity-10 p-3">
                <button className="btn btn-warning w-100 fw-bold text-dark d-flex align-items-center justify-content-center py-3 fs-6"
                onClick={() => setModalAberto(true)}>
                    <AlertTriangle size={24} className="me-2"/> Registrar Fora do Padrão
                </button>
            </div>
        </div>
      )}

      {/* MODAL */}
      {modalAberto && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border-secondary text-white">
              <div className="modal-header border-secondary">
                <h4 className="modal-title text-warning fw-bold">Embarque Extra</h4>
                <button type="button" className="btn-close btn-close-white" onClick={fecharModal}></button>
              </div>
              <div className="modal-body p-4">
                {!alunoEncontrado ? (
                    <div className="input-group input-group-lg">
                        <input className="form-control bg-secondary border-0 text-white" placeholder="Digite Nome ou Matrícula..."
                            value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                        <button className="btn btn-primary px-4" onClick={buscarAlunoForaPadrao}><Search size={24}/></button>
                    </div>
                ) : (
                    <div>
                        <p className="fs-5">Aluno encontrado: <strong className="text-primary">{alunoEncontrado.nomeCompleto}</strong></p>
                        <input className="form-control form-control-lg bg-secondary border-0 text-white mb-3" placeholder="Motivo (Opcional)" value={motivo} onChange={e => setMotivo(e.target.value)} />
                        <button className="btn btn-success btn-lg w-100" onClick={() => registrarEmbarque(alunoEncontrado.id, 'EMBARCOU', true, motivo)}>Confirmar Embarque</button>
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