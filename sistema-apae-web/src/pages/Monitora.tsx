import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowRight, Search, Flag, LayoutGrid, ThumbsUp, Lock, User, Navigation, Clock } from 'lucide-react';

interface Aluno { id: number; nomeCompleto: string; matricula: string; tipoAlimentar: string; statusHoje?: 'EMBARCOU' | 'FALTA'; }
interface Parada { id: number; nomeParada: string; endereco: string; alunosEsperados: Aluno[]; }
interface RotaDados { onibusId: number; nomeOnibus: string; placa: string; paradas: Parada[]; }
interface OnibusResumo { id: number; nomeOnibus: string; placa: string; nomeMotorista: string; }
interface StatusOnibus { onibusId: number; concluida: boolean; totalAlunos: number; embarcaram: number; faltaram: number; }

export function Monitora() {
  const [rota, setRota] = useState<RotaDados | null>(null);
  const [indiceParada, setIndiceParada] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [rotaConcluidaHoje, setRotaConcluidaHoje] = useState(false);

  // Estados Admin e Modal
  const [listaOnibus, setListaOnibus] = useState<OnibusResumo[]>([]);
  const [statusFrota, setStatusFrota] = useState<StatusOnibus[]>([]);
  const [selecionandoOnibus, setSelecionandoOnibus] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [alunoEncontrado, setAlunoEncontrado] = useState<any>(null);
  const [motivo, setMotivo] = useState('');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  useEffect(() => { iniciarTela(); }, []);

  const iniciarTela = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [resOnibus, resStatus] = await Promise.all([
            axios.get('http://localhost:8080/api/onibus'),
            axios.get('http://localhost:8080/api/monitora/status-frota')
        ]);
        setListaOnibus(resOnibus.data);
        setStatusFrota(resStatus.data);
        setSelecionandoOnibus(true);
        setLoading(false);
      } else {
        await carregarRotaUsuario();
      }
    } catch (e) { console.error(e); setLoading(false); }
  };

  const verificarStatusDoDia = async (onibusId: number) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/monitora/status-dia/${onibusId}`);
        if (res.data.concluida) {
            setRotaConcluidaHoje(true);
            return true;
        }
    } catch (e) { console.error("Erro status"); }
    return false;
  };

  const carregarRotaUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-atual/${usuarioLogado.id}`);
      const dadosRota = res.data;
      const concluida = await verificarStatusDoDia(dadosRota.onibusId);
      if (!concluida) setRota(dadosRota);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const carregarRotaOnibusEspecifico = async (onibusId: number) => {
    setLoading(true);
    try {
      const concluida = await verificarStatusDoDia(onibusId);
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-por-onibus/${onibusId}`);
      setRota(res.data);
      setSelecionandoOnibus(false);
      setIndiceParada(0);
      if (concluida) setRotaConcluidaHoje(true); else setRotaConcluidaHoje(false);
    } catch (error) { alert("Erro ao carregar rota."); } finally { setLoading(false); }
  };

  const finalizarRota = async () => {
    if (!rota) return;
    if (window.confirm("Todos os alunos foram entregues/buscados. Deseja FINALIZAR o expediente?")) {
        try {
            await axios.post(`http://localhost:8080/api/monitora/finalizar/${rota.onibusId}`);
            setRotaConcluidaHoje(true);
        } catch (e) { alert("Erro ao finalizar."); }
    }
  };

  const registrarEmbarque = async (alunoId: number, status: string) => { 
    if(rota) {
        const novaRota = {...rota};
        novaRota.paradas[indiceParada].alunosEsperados.find((a:any) => a.id === alunoId).statusHoje = status;
        setRota(novaRota);
        await axios.post('http://localhost:8080/api/chamadas', { alunoId, status });
    }
  };

  const validarEAvancar = () => {
    if (!rota) return;
    const pendentes = rota.paradas[indiceParada].alunosEsperados.filter((a:any) => !a.statusHoje);
    if (pendentes.length > 0) return alert("Marque todos os alunos antes de continuar.");
    if (indiceParada === rota.paradas.length - 1) finalizarRota();
    else if(window.confirm("Avançar para próxima parada?")) setIndiceParada(prev => prev + 1);
  };

  const buscarAlunoForaPadrao = async () => {
    if (!termoBusca) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/alunos/buscar?termo=${termoBusca}`); 
      if (res.data.length > 0) setAlunoEncontrado(res.data[0]); else alert("Não encontrado.");
    } catch (e) { alert("Erro."); }
  };
  const fecharModal = () => { setModalAberto(false); setTermoBusca(''); setAlunoEncontrado(null); };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  if (rotaConcluidaHoje && !selecionandoOnibus) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
            <div className="card border-0 shadow-lg bg-dark text-white text-center p-5" style={{maxWidth: '600px'}}>
                <div className="mb-4 text-success"><ThumbsUp size={80} /></div>
                <h2 className="fw-bold text-white mb-3">Rota Finalizada</h2>
                <p className="lead text-muted mb-4">Esta rota já foi concluída hoje.</p>
                <div className="alert alert-dark border border-secondary d-flex align-items-center justify-content-center p-3 text-muted">
                    <Lock size={20} className="me-2"/> <span>Acesso Bloqueado</span>
                </div>
                {isAdmin && <button className="btn btn-outline-primary mt-4 fw-bold" onClick={() => { setRotaConcluidaHoje(false); setSelecionandoOnibus(true); }}>Voltar para Central</button>}
            </div>
        </div>
    );
  }

  // --- TELA DE SELEÇÃO ADMIN (CORREÇÃO DE GRID) ---
  if (isAdmin && selecionandoOnibus) {
    return (
        // w-100 garante largura total e overflow-hidden evita rolagem horizontal indesejada
        <div className="container-fluid w-100" style={{ overflowX: 'hidden' }}> 
            
            <div className="mb-4 d-flex align-items-center border-bottom border-secondary border-opacity-25 pb-3 mt-2">
                <div className="bg-primary p-2 rounded me-3 shadow-lg flex-shrink-0">
                    <LayoutGrid size={24} className="text-white"/>
                </div>
                <div>
                    <h4 className="text-white fw-bold mb-0">Central de Operações</h4>
                    <small className="text-white-50">Selecione um veículo</small>
                </div>
            </div>
            
            {/* GRID AJUSTADO:
               - col-12: Mobile (1 card)
               - col-md-6: Tablet (2 cards) - ANTES ESTAVA col-lg-6, mudei para md para ser mais fluido
               - col-xl-4: Desktop (3 cards) - ANTES ESTAVA xxl-4, mudei para xl para aproveitar melhor
            */}
            <div className="row g-3">
                {listaOnibus.map(bus => {
                    const status = statusFrota.find(s => s.onibusId === bus.id);
                    const isConcluido = status?.concluida;
                    const emAndamento = (status?.embarcaram || 0) > 0 && !isConcluido;

                    return (
                        <div key={bus.id} className="col-12 col-md-6 col-xl-4">
                            <div 
                                onClick={() => carregarRotaOnibusEspecifico(bus.id)} 
                                className="card h-100 bg-dark text-white border-secondary border-opacity-50 hover-scale cursor-pointer overflow-hidden shadow-sm"
                                style={{cursor: 'pointer', transition: 'all 0.2s', minHeight: '220px'}}
                            >
                                <div className={`h-1 w-100 ${isConcluido ? 'bg-success' : (emAndamento ? 'bg-warning' : 'bg-primary')}`}></div>
                                
                                <div className="card-body p-3 d-flex flex-column justify-content-between">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center overflow-hidden">
                                            <div className="bg-secondary bg-opacity-25 p-2 rounded-circle me-2 flex-shrink-0">
                                                <Bus size={20} className="text-white"/>
                                            </div>
                                            <div className="text-truncate">
                                                <h6 className="fw-bold mb-0 text-truncate">{bus.nomeOnibus}</h6>
                                                <span className="badge bg-dark border border-secondary text-white-50 mt-1" style={{fontSize: '0.65rem'}}>{bus.placa}</span>
                                            </div>
                                        </div>
                                        
                                        {isConcluido ? (
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 flex-shrink-0"><CheckCircle size={12} className="me-1 mb-1"/> Finalizado</span>
                                        ) : emAndamento ? (
                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 flex-shrink-0"><Clock size={12} className="me-1 mb-1"/> Em Rota</span>
                                        ) : (
                                            <span className="badge bg-secondary bg-opacity-25 text-muted border border-secondary border-opacity-25 flex-shrink-0"><Navigation size={12} className="me-1 mb-1"/> Aguardando</span>
                                        )}
                                    </div>
                                    
                                    <div className="d-flex align-items-center text-white-50 mb-3 bg-black bg-opacity-20 p-2 rounded small">
                                        <User size={16} className="me-2 flex-shrink-0"/>
                                        <span className="fw-bold me-1">Motorista:</span>
                                        <span className="text-white text-truncate">{bus.nomeMotorista || 'Não definido'}</span>
                                    </div>

                                    <button className="btn btn-sm btn-outline-primary w-100 fw-bold d-flex align-items-center justify-content-center">
                                        <Search size={16} className="me-2"/>
                                        {isConcluido ? 'Ver Rota' : 'Monitorar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  }

  // --- RESTO DO CÓDIGO (Monitoramento Individual) ---
  
  if (!rota) return <div className="text-white text-center p-5">Rota não encontrada.</div>;

  const paradaAtual = rota.paradas[indiceParada];
  const isUltima = indiceParada === rota.paradas.length - 1;

  return (
    <div className="container pb-5" style={{maxWidth: '800px'}}>
      
      <div className="card border-0 shadow-sm mb-3" style={{background: '#1e293b'}}>
        <div className="card-body text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1"><Bus className="me-2"/> {rota.nomeOnibus}</h5>
              <small className="text-muted">{rota.placa}</small>
            </div>
            <div className="text-end">
              <span className="badge bg-primary fs-6">{indiceParada + 1} / {rota.paradas.length}</span>
              <div className="small text-muted mt-1">Paradas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-lg mb-4 overflow-hidden">
        <div className="card-header bg-primary text-white py-3 text-center position-relative">
            {isAdmin && (
                <button onClick={() => setSelecionandoOnibus(true)} className="btn btn-sm btn-dark bg-opacity-25 border-0 text-white position-absolute top-50 start-0 translate-middle-y ms-3">
                    Voltar
                </button>
            )}
            
            <h4 className="fw-bold mb-0">{paradaAtual.nomeParada}</h4>
            <small className="opacity-75"><MapPin size={14} className="me-1"/>{paradaAtual.endereco}</small>
            
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                <button className={`btn ${isUltima ? 'btn-success border-white' : 'btn-sm btn-light bg-opacity-25 border-0 text-white'} `} onClick={validarEAvancar}>
                  {isUltima ? <><Flag size={18} className="me-1"/> FINALIZAR</> : <ArrowRight size={24}/>}
                </button>
            </div>
        </div>

        <div className="card-body p-0 bg-dark">
            <div className="list-group list-group-flush">
                {paradaAtual.alunosEsperados.map((aluno:any) => (
                    <div key={aluno.id} className="list-group-item bg-dark text-white border-secondary p-3 d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="fw-bold mb-0">{aluno.nomeCompleto}</h6>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>{aluno.matricula} • {aluno.tipoAlimentar}</small>
                        </div>
                        <div className="d-flex gap-2">
                            {!aluno.statusHoje ? (
                                <>
                                    <button onClick={() => registrarEmbarque(aluno.id, 'EMBARCOU')} className="btn btn-success btn-sm fw-bold"><CheckCircle size={18}/></button>
                                    <button onClick={() => registrarEmbarque(aluno.id, 'FALTA')} className="btn btn-outline-danger btn-sm"><XCircle size={18}/></button>
                                </>
                            ) : (
                                <span className={`badge ${aluno.statusHoje==='EMBARCOU'?'bg-success':'bg-danger'} p-2`}>{aluno.statusHoje}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="card-footer bg-secondary bg-opacity-10 p-3">
            <button className="btn btn-warning w-100 fw-bold text-dark d-flex align-items-center justify-content-center" onClick={() => setModalAberto(true)}>
                <AlertTriangle size={20} className="me-2"/> Registrar Fora do Padrão
            </button>
        </div>
      </div>

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
                        <input className="form-control bg-secondary border-0 text-white" placeholder="Nome ou Matrícula..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                        <button className="btn btn-primary" onClick={buscarAlunoForaPadrao}><Search size={18}/></button>
                    </div>
                ) : (
                    <div>
                        <p>Aluno: <strong>{alunoEncontrado.nomeCompleto}</strong></p>
                        <input className="form-control bg-secondary border-0 text-white mb-3" placeholder="Motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />
                        <button className="btn btn-success w-100" onClick={() => registrarEmbarque(alunoEncontrado.id, 'EMBARCOU')}>Confirmar</button>
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