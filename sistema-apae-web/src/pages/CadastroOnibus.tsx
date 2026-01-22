import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, Trash2, Plus, Edit, Save, CheckCircle, XCircle, Navigation } from 'lucide-react';

interface Parada {
  id?: number;
  nomeParada: string;
  endereco: string;
  latitude?: string;
  longitude?: string;
  onibus?: { id: number };
}

interface Onibus {
  id?: number;
  nomeOnibus: string;
  nomeMotorista: string;
  placa: string;
  cor: string;
  capacidadeMaxima: number;
  suportaDeficiente: boolean;
}

export function CadastroOnibus() {
  const [frota, setFrota] = useState<Onibus[]>([]);
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const [loading, setLoading] = useState(false);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);

  // Estados para Gestão de Rotas (Paradas)
  const [paradasDoBus, setParadasDoBus] = useState<Parada[]>([]);
  const [novaParada, setNovaParada] = useState<Parada>({ nomeParada: '', endereco: '', latitude: '-23.55', longitude: '-46.63' });

  const formInicial = { 
    nomeOnibus: '', nomeMotorista: '', placa: '', cor: 'Amarelo', capacidadeMaxima: 45, suportaDeficiente: false 
  };
  const [form, setForm] = useState(formInicial);

  useEffect(() => { carregarFrota(); }, []);

  const carregarFrota = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/onibus');
      setFrota(res.data);
    } catch (e) { console.error("Erro ao carregar ônibus"); }
  };

  const carregarParadas = async (busId: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/paradas/bus/${busId}`);
      setParadasDoBus(res.data);
    } catch (e) { console.error("Erro ao carregar paradas"); }
  };

  const handleSalvarOnibus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let busId = idEdicao;
      if (idEdicao) {
        await axios.put(`http://localhost:8080/api/onibus/${idEdicao}`, form);
        alert("Dados do ônibus atualizados!");
      } else {
        const res = await axios.post('http://localhost:8080/api/onibus', form);
        busId = res.data.id;
        alert("Ônibus criado! Agora você pode adicionar rotas.");
        setIdEdicao(busId); 
      }
      carregarFrota();
    } catch (error) { alert("Erro ao salvar ônibus."); } 
    finally { setLoading(false); }
  };

  const handleAdicionarParada = async () => {
    if (!idEdicao) return alert("Salve o ônibus antes de adicionar paradas.");
    if (!novaParada.nomeParada || !novaParada.endereco) return alert("Preencha nome e endereço.");

    try {
      await axios.post('http://localhost:8080/api/paradas', {
        ...novaParada,
        onibus: { id: idEdicao }
      });
      setNovaParada({ nomeParada: '', endereco: '', latitude: '-23.55', longitude: '-46.63' });
      carregarParadas(idEdicao);
    } catch (e) { alert("Erro ao adicionar parada."); }
  };

  const handleExcluirParada = async (id: number) => {
    if(!window.confirm("Remover esta parada?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/paradas/${id}`);
      if(idEdicao) carregarParadas(idEdicao);
    } catch (e) { alert("Não foi possível excluir (pode haver alunos vinculados)."); }
  };

  const abrirEdicao = (bus: Onibus) => {
    setForm(bus);
    setIdEdicao(bus.id || null);
    if (bus.id) carregarParadas(bus.id);
    setModo('CADASTRO');
  };

  const limparForm = () => {
    setForm(formInicial);
    setIdEdicao(null);
    setParadasDoBus([]);
  };

  const handleExcluirOnibus = async (id: number) => {
    if(!window.confirm("Tem certeza? Isso apagará o histórico deste ônibus.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/onibus/${id}`);
      carregarFrota();
    } catch (e) { alert("Erro ao excluir."); }
  };

  return (
    <div className="container" style={{maxWidth: '1200px'}}>
      
      <div className="d-flex justify-content-between align-items-center my-4">
        <div>
            <h3 className="fw-bold text-white d-flex align-items-center"><Bus className="me-2 text-primary"/> Gestão da Frota</h3>
        </div>
        {modo === 'LISTA' ? (
          <button className="btn btn-primary fw-bold" onClick={() => { limparForm(); setModo('CADASTRO'); }}>
            <Plus size={18} className="me-2"/> Novo Ônibus
          </button>
        ) : (
          <button className="btn btn-outline-secondary" onClick={() => { setModo('LISTA'); limparForm(); }}>Voltar para Lista</button>
        )}
      </div>

      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm" style={{background: '#1e293b'}}>
          <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                  <tr className="text-secondary small text-uppercase">
                  <th className="ps-4">Veículo</th>
                  <th>Placa</th>
                  <th>Motorista</th>
                  <th>Lotação</th>
                  <th className="text-center">Acessível</th>
                  <th className="text-end pe-4">Ações</th>
                  </tr>
              </thead>
              <tbody>
                  {frota.map(bus => (
                  <tr key={bus.id}>
                      <td className="ps-4 fw-bold">{bus.nomeOnibus}</td>
                      <td><span className="badge bg-secondary">{bus.placa}</span></td>
                      <td>{bus.nomeMotorista || '-'}</td>
                      <td>{bus.capacidadeMaxima} lug.</td>
                      <td className="text-center">
                            {bus.suportaDeficiente 
                                ? <span className="text-success small fw-bold"><CheckCircle size={14} className="me-1"/>Sim</span> 
                                : <span className="text-muted small"><XCircle size={14} className="me-1"/>Não</span>
                            }
                      </td>
                      <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirEdicao(bus)}>
                          <Edit size={16}/> Editar / Rotas
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluirOnibus(bus.id!)}>
                          <Trash2 size={16}/>
                      </button>
                      </td>
                  </tr>
                  ))}
              </tbody>
              </table>
          </div>
        </div>
      )}

      {modo === 'CADASTRO' && (
        <div className="row g-4">
          
          {/* COLUNA ESQUERDA: DADOS DO ÔNIBUS */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm h-100" style={{background: '#1e293b'}}>
              <div className="card-header border-secondary bg-transparent py-3">
                 <h5 className="fw-bold text-white mb-0">Dados do Veículo</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSalvarOnibus}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Nome (Apelido)</label>
                    <input className="form-control" required value={form.nomeOnibus} onChange={e => setForm({...form, nomeOnibus: e.target.value})}/>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                        <label className="form-label text-muted small">Placa</label>
                        <input className="form-control text-uppercase" required value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})}/>
                    </div>
                    <div className="col-6">
                        <label className="form-label text-muted small">Capacidade</label>
                        <input type="number" className="form-control" required value={form.capacidadeMaxima} onChange={e => setForm({...form, capacidadeMaxima: Number(e.target.value)})}/>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Motorista</label>
                    <input className="form-control" value={form.nomeMotorista} onChange={e => setForm({...form, nomeMotorista: e.target.value})}/>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                        <input className="form-check-input" type="checkbox" id="checkPcd" 
                            checked={form.suportaDeficiente} 
                            onChange={e => setForm({...form, suportaDeficiente: e.target.checked})}/>
                        <label className="form-check-label text-white" htmlFor="checkPcd">Acessibilidade (PCD)</label>
                  </div>

                  <button type="submit" className="btn btn-success w-100 fw-bold" disabled={loading}>
                    <Save size={18} className="me-2"/> Salvar Dados Básicos
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: GESTÃO DE ROTAS */}
          <div className="col-md-7">
            <div className="card border-0 shadow-sm h-100" style={{background: '#1e293b'}}>
              <div className="card-header border-secondary bg-transparent py-3 d-flex justify-content-between align-items-center">
                 <h5 className="fw-bold text-white mb-0">Rotas e Paradas</h5>
                 {!idEdicao && <span className="badge bg-warning text-dark">Salve o ônibus primeiro</span>}
              </div>
              <div className="card-body">
                
                {/* LISTA DE PARADAS */}
                {idEdicao ? (
                    <>
                        <div className="mb-4">
                            <h6 className="text-muted small text-uppercase mb-3">Paradas Atuais</h6>
                            {paradasDoBus.length === 0 ? (
                                <p className="text-muted fst-italic">Nenhuma parada cadastrada.</p>
                            ) : (
                                <div className="list-group">
                                    {paradasDoBus.map((p, idx) => (
                                        <div key={p.id} className="list-group-item bg-dark border-secondary text-white d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="badge bg-primary me-2">{idx + 1}</span>
                                                <strong>{p.nomeParada}</strong>
                                                <div className="small text-muted">{p.endereco}</div>
                                            </div>
                                            <button onClick={() => handleExcluirParada(p.id!)} className="btn btn-sm btn-outline-danger border-0">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FORMULÁRIO NOVA PARADA */}
                        <div className="bg-dark p-3 rounded border border-secondary">
                            <h6 className="text-white small fw-bold mb-3"><Plus size={16} className="me-1"/> Adicionar Nova Parada</h6>
                            <div className="row g-2">
                                <div className="col-md-5">
                                    <input placeholder="Nome (Ex: Praça)" className="form-control form-control-sm" 
                                        value={novaParada.nomeParada} onChange={e => setNovaParada({...novaParada, nomeParada: e.target.value})} />
                                </div>
                                <div className="col-md-7">
                                    <input placeholder="Endereço" className="form-control form-control-sm" 
                                        value={novaParada.endereco} onChange={e => setNovaParada({...novaParada, endereco: e.target.value})} />
                                </div>
                                <div className="col-12 mt-2">
                                    <button onClick={handleAdicionarParada} className="btn btn-primary btn-sm w-100 fw-bold">Adicionar à Rota</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <Navigation size={48} className="mb-3 opacity-25"/>
                        <p>Salve os dados do veículo ao lado para liberar a gestão de rotas.</p>
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