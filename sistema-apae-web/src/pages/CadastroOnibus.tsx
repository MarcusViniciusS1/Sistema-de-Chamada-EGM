import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, Trash2, Plus, Edit, Save, CheckCircle, XCircle } from 'lucide-react';

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

  const formInicial = { 
    nomeOnibus: '', 
    nomeMotorista: '', 
    placa: '', 
    cor: 'Amarelo', 
    capacidadeMaxima: 45, 
    suportaDeficiente: false 
  };
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    carregarFrota();
  }, []);

  const carregarFrota = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/onibus');
      setFrota(res.data);
    } catch (e) {
      console.error("Erro ao carregar ônibus");
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (idEdicao) {
        // Editar
        await axios.put(`http://localhost:8080/api/onibus/${idEdicao}`, form);
        alert("Ônibus atualizado com sucesso!");
      } else {
        // Criar
        await axios.post('http://localhost:8080/api/onibus', form);
        alert("Ônibus cadastrado com sucesso!");
      }
      
      limparForm();
      carregarFrota();
      setModo('LISTA');
    } catch (error) {
      alert("Erro ao salvar. Verifique se a placa já existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (bus: Onibus) => {
    setForm(bus);
    setIdEdicao(bus.id || null);
    setModo('CADASTRO');
  };

  const handleExcluir = async (id: number) => {
    if(!window.confirm("Tem certeza? Isso apagará o histórico deste ônibus.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/onibus/${id}`);
      carregarFrota();
    } catch (e) { alert("Erro ao excluir."); }
  };

  const limparForm = () => {
    setForm(formInicial);
    setIdEdicao(null);
  };

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center my-4">
        <div>
            <h3 className="fw-bold text-white d-flex align-items-center">
                <Bus className="me-2 text-primary"/> Gestão da Frota
            </h3>
            <p className="text-muted mb-0">Gerencie os veículos e motoristas.</p>
        </div>
        
        {modo === 'LISTA' ? (
          <button className="btn btn-primary fw-bold" onClick={() => { limparForm(); setModo('CADASTRO'); }}>
            <Plus size={18} className="me-2"/> Novo Ônibus
          </button>
        ) : (
          <button className="btn btn-outline-secondary" onClick={() => setModo('LISTA')}>Cancelar</button>
        )}
      </div>

      {/* MODO LISTA */}
      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                    <th className="ps-4">Ônibus</th>
                    <th>Placa</th>
                    <th>Motorista</th>
                    <th>Lotação</th>
                    <th>Acessível</th>
                    <th className="text-end pe-4">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {frota.map(bus => (
                    <tr key={bus.id}>
                        <td className="ps-4">
                            <div className="fw-bold">{bus.nomeOnibus}</div>
                            <small className="text-muted">{bus.cor}</small>
                        </td>
                        <td><span className="badge bg-dark border border-secondary text-white">{bus.placa}</span></td>
                        <td>{bus.nomeMotorista || '-'}</td>
                        <td>{bus.capacidadeMaxima} lug.</td>
                        <td>
                            {bus.suportaDeficiente 
                                ? <span className="text-success small fw-bold"><CheckCircle size={14} className="me-1"/>Sim</span> 
                                : <span className="text-muted small"><XCircle size={14} className="me-1"/>Não</span>
                            }
                        </td>
                        <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(bus)}>
                            <Edit size={16}/>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(bus.id!)}>
                            <Trash2 size={16}/>
                        </button>
                        </td>
                    </tr>
                    ))}
                    {frota.length === 0 && <tr><td colSpan={6} className="text-center py-5 text-muted">Nenhum ônibus cadastrado.</td></tr>}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {/* MODO CADASTRO */}
      {modo === 'CADASTRO' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent py-3 border-0">
             <h5 className="fw-bold text-white mb-0">
               {idEdicao ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
             </h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSalvar}>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nome do Ônibus (Apelido)</label>
                  <input className="form-control" required placeholder="Ex: Amarelinho 01" 
                    value={form.nomeOnibus} onChange={e => setForm({...form, nomeOnibus: e.target.value})}/>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Placa</label>
                  <input className="form-control text-uppercase" required placeholder="ABC-1234" maxLength={8}
                    value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})}/>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Cor</label>
                  <input className="form-control" required placeholder="Ex: Amarelo" 
                    value={form.cor} onChange={e => setForm({...form, cor: e.target.value})}/>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Nome do Motorista</label>
                  <input className="form-control" placeholder="Ex: Sr. João" 
                    value={form.nomeMotorista} onChange={e => setForm({...form, nomeMotorista: e.target.value})}/>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Capacidade Máxima</label>
                  <input type="number" className="form-control" required 
                    value={form.capacidadeMaxima} onChange={e => setForm({...form, capacidadeMaxima: Number(e.target.value)})}/>
                </div>

                <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" id="checkPcd" 
                            checked={form.suportaDeficiente} 
                            onChange={e => setForm({...form, suportaDeficiente: e.target.checked})}/>
                        <label className="form-check-label" htmlFor="checkPcd">Acessibilidade (PCD)</label>
                    </div>
                </div>

              </div>

              <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary border-opacity-25">
                <button type="submit" className="btn btn-success fw-bold px-5" disabled={loading}>
                  <Save size={18} className="me-2"/> {loading ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}