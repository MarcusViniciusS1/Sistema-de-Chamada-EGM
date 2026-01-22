import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowRight, Flag, LayoutGrid, Eye, ThumbsUp, Lock, Search } from 'lucide-react';

interface RotaDados {
  onibusId: number;
  nomeOnibus: string;
  placa: string;
  paradas: any[];
}

export function Monitora() {
  const [rota, setRota] = useState<RotaDados | null>(null);
  const [indiceParada, setIndiceParada] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [rotaConcluidaHoje, setRotaConcluidaHoje] = useState(false);

  // Estados Admin e Modal
  const [listaOnibus, setListaOnibus] = useState<any[]>([]);
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
        const res = await axios.get('http://localhost:8080/api/onibus');
        setListaOnibus(res.data);
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
    } catch (e) { console.error("Erro ao verificar status"); }
    return false;
  };

  const carregarRotaUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-atual/${usuarioLogado.id}`);
      const dadosRota = res.data;
      const concluida = await verificarStatusDoDia(dadosRota.onibusId);
      
      if (!concluida) {
          setRota(dadosRota);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const carregarRotaOnibusEspecifico = async (onibusId: number) => {
    setLoading(true);
    try {
      const concluida = await verificarStatusDoDia(onibusId);
      if (concluida) alert("Aviso: Esta rota já consta como finalizada hoje.");
      
      const res = await axios.get(`http://localhost:8080/api/monitora/rota-por-onibus/${onibusId}`);
      setRota(res.data);
      setSelecionandoOnibus(false);
      setIndiceParada(0);
      setRotaConcluidaHoje(false); 
    } catch (error) { 
        alert("Erro ao carregar rota."); 
    } finally { setLoading(false); }
  };

  const finalizarRota = async () => {
    if (!rota) return;
    if (window.confirm("Todos os alunos foram entregues/buscados. Deseja FINALIZAR o expediente deste ônibus?")) {
        try {
            await axios.post(`http://localhost:8080/api/monitora/finalizar/${rota.onibusId}`);
            setRotaConcluidaHoje(true); // Bloqueia a tela
        } catch (e) {
            alert("Erro ao finalizar rota. Verifique se o servidor foi reiniciado (Erro 404).");
        }
    }
  };

  // --- REGISTRO E VALIDACAO ---
  const registrarEmbarque = async (alunoId: number, status: string) => { 
    if(rota) {
        const novaRota = {...rota};
        novaRota.paradas[indiceParada].alunosEsperados.find((a:any) => a.id === alunoId).statusHoje = status;
        setRota(novaRota);
        await axios.post('http://localhost:8080/api/chamadas', { alunoId, status });
    }
  };

  const buscarAlunoForaPadrao = async () => {
    if (!termoBusca) return;
    try {
      const res = await axios.get('http://localhost:8080/api/alunos'); 
      const encontrado = res.data.find((a: any) => a.nomeCompleto.toLowerCase().includes(termoBusca.toLowerCase()) || a.matricula === termoBusca);
      if (encontrado) setAlunoEncontrado(encontrado); else alert("Aluno não encontrado.");
    } catch (e) { alert("Erro ao buscar."); }
  };
  const fecharModal = () => { setModalAberto(false); setTermoBusca(''); setAlunoEncontrado(null); setMotivo(''); };

  const validarEAvancar = () => {
    if (!rota) return;
    const pendentes = rota.paradas[indiceParada].alunosEsperados.filter((a:any) => !a.statusHoje);
    if (pendentes.length > 0) return alert("Marque todos os alunos desta parada antes de continuar.");
    
    if (indiceParada === rota.paradas.length - 1) {
        finalizarRota();
    } else {
        if(window.confirm("Avançar para próxima parada?")) setIndiceParada(prev => prev + 1);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  // TELA DE BLOQUEIO / AGRADECIMENTO
  if (rotaConcluidaHoje && !selecionandoOnibus) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
            <div className="card border-0 shadow-lg bg-dark text-white text-center p-5 animate-fade-in" style={{maxWidth: '600px'}}>
                <div className="mb-4 text-success"><ThumbsUp size={80} /></div>
                <h2 className="fw-bold text-white mb-3">Rota Concluída com Sucesso!</h2>
                <p className="lead text-muted mb-4">Obrigado pelo seu excelente trabalho hoje.<br/>Todos os dados foram salvos com segurança.</p>
                <div className="alert alert-warning bg-opacity-10 border-0 text-warning d-flex align-items-center justify-content-center p-3">
                    <Lock size={20} className="me-2"/>
                    <span>O acesso a esta rota será liberado novamente amanhã.</span>
                </div>
                {isAdmin && (
                    <button className="btn btn-outline-light mt-4" onClick={() => { setRotaConcluidaHoje(false); setSelecionandoOnibus(true); }}>Voltar para Central (Admin)</button>
                )}
            </div>
        </div>
    );
  }

  // TELA DE SELEÇÃO ADMIN
  if (isAdmin && selecionandoOnibus) {
    return (
        <div className="container py-4">
            <h3 className="text-white fw-bold mb-4"><LayoutGrid className="me-2"/> Central de Monitoramento</h3>
            <div className="row g-3">
                {listaOnibus.map(bus => (
                    <div key={bus.id} className="col-md-4">
                        <div onClick={() => carregarRotaOnibusEspecifico(bus.id)} 
                             className="card bg-dark text-white border-secondary p-4 text-center hover-scale shadow-sm" style={{cursor:'pointer'}}>
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3"><Bus size={32} className="text-primary"/></div>
                            <h5 className="fw-bold">{bus.nomeOnibus}</h5>
                            <small className="text-muted">{bus.placa}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (!rota) return <div className="text-white text-center p-5">Rota não encontrada ou usuário sem vínculo.</div>;

  const paradaAtual = rota.paradas[indiceParada];
  const isUltima = indiceParada === rota.paradas.length - 1;

  return (
    <div className="container pb-5" style={{maxWidth: '900px'}}>
        
        {/* CABEÇALHO DA ROTA */}
        <div className="card bg-dark text-white border-0 shadow-sm mb-3">
            <div className="card-body py-4 d-flex justify-content-between align-items-center">
                <div>
                    <h3 className="fw-bold mb-0"><Bus className="me-2" size={28}/> {rota.nomeOnibus}</h3>
                    <div className="text-muted">{rota.placa}</div>
                </div>
                <div className="text-end">
                    <span className="badge bg-primary fs-5">{indiceParada + 1} / {rota.paradas.length}</span>
                    <div className="small text-muted">Paradas</div>
                </div>
            </div>
        </div>

        {/* PARADA ATUAL */}
        <div className="card bg-dark border-0 shadow-lg overflow-hidden mb-4">
            <div className="card-header bg-primary text-white py-4 text-center position-relative">
                <h2 className="fw-bold mb-1">{paradaAtual.nomeParada}</h2>
                <div className="opacity-75 fs-5"><MapPin size={18} className="me-1"/>{paradaAtual.endereco}</div>
                
                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <button className={`btn ${isUltima ? 'btn-success border-white' : 'btn-light bg-opacity-25 text-white'} btn-lg p-3`} 
                        onClick={validarEAvancar}>
                        {isUltima ? <><Flag size={24} className="me-2"/>FINALIZAR</> : <ArrowRight size={24}/>}
                    </button>
                </div>
            </div>

            {/* LISTA DE ALUNOS */}
            <div className="list-group list-group-flush">
                {paradaAtual.alunosEsperados.map((aluno:any) => (
                    <div key={aluno.id} className="list-group-item bg-dark text-white border-secondary p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1 fw-bold fs-5">{aluno.nomeCompleto}</h5>
                            <small className="text-muted">{aluno.matricula} • <span className="text-warning">{aluno.tipoAlimentar}</span></small>
                        </div>
                        <div className="d-flex gap-2">
                            {!aluno.statusHoje ? (
                                <>
                                    <button onClick={() => registrarEmbarque(aluno.id, 'EMBARCOU')} className="btn btn-success btn-lg px-3"><CheckCircle/></button>
                                    <button onClick={() => registrarEmbarque(aluno.id, 'FALTA')} className="btn btn-outline-danger btn-lg px-3"><XCircle/></button>
                                </>
                            ) : (
                                <span className={`badge ${aluno.statusHoje==='EMBARCOU'?'bg-success':'bg-danger'} p-2 fs-6`}>{aluno.statusHoje}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* BOTÃO FORA DO PADRÃO (VOLTOU AO RODAPÉ) */}
            <div className="card-footer bg-secondary bg-opacity-10 p-3">
                <button className="btn btn-warning w-100 fw-bold text-dark d-flex align-items-center justify-content-center py-3 fs-6"
                onClick={() => setModalAberto(true)}>
                    <AlertTriangle size={24} className="me-2"/> Registrar Aluno Fora do Padrão
                </button>
            </div>
        </div>

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
                        <input className="form-control bg-secondary border-0 text-white" placeholder="Nome ou Matrícula..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                        <button className="btn btn-primary px-4" onClick={buscarAlunoForaPadrao}><Search size={24}/></button>
                    </div>
                ) : (
                    <div>
                        <p className="fs-5">Aluno: <strong className="text-primary">{alunoEncontrado.nomeCompleto}</strong></p>
                        <input className="form-control bg-secondary border-0 text-white mb-3" placeholder="Motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />
                        <button className="btn btn-success w-100 btn-lg" onClick={() => registrarEmbarque(alunoEncontrado.id, 'EMBARCOU')}>Confirmar Embarque</button>
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