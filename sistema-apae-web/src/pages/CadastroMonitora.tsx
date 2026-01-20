import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Trash2, Plus, Save, Key, User } from 'lucide-react';

interface Monitora {
  id?: number;
  nome: string;
  telefone: string;
  endereco: string;
  cpf: string;
  username: string;
  senha?: string;
}

export function CadastroMonitora() {
  const [monitoras, setMonitoras] = useState<Monitora[]>([]);
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const [loading, setLoading] = useState(false);
  
  // Verifica se é ADMIN
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  const formInicial = { nome: '', telefone: '', endereco: '', cpf: '', username: '', senha: '' };
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    carregarMonitoras();
  }, []);

  const carregarMonitoras = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/monitoras');
      setMonitoras(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/monitoras', form);
      alert("Monitora e Usuário criados com sucesso!");
      setForm(formInicial);
      setModo('LISTA');
      carregarMonitoras();
    } catch (error) {
      alert("Erro ao salvar. Verifique se o login já existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if(!window.confirm("Isso apagará a monitora e o acesso dela ao sistema. Continuar?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/monitoras/${id}`);
      carregarMonitoras();
    } catch (e) { alert("Erro ao excluir"); }
  };

  // Se não for admin, mostra acesso negado
  if (!isAdmin) {
    return (
      <div className="alert alert-danger m-4">
        <h4 className="fw-bold"><UserCheck size={24}/> Acesso Negado</h4>
        <p>Apenas administradores podem gerenciar monitoras.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{maxWidth: '900px'}}>
      
      <div className="d-flex justify-content-between align-items-center my-4">
        <h3 className="fw-bold text-primary">Gestão de Monitoras</h3>
        {modo === 'LISTA' && (
          <button className="btn btn-primary fw-bold" onClick={() => setModo('CADASTRO')}>
            <Plus size={18} className="me-2"/> Nova Monitora
          </button>
        )}
        {modo === 'CADASTRO' && (
          <button className="btn btn-outline-secondary" onClick={() => setModo('LISTA')}>
            Voltar
          </button>
        )}
      </div>

      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Usuário (Login)</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoras.map(m => (
                    <tr key={m.id}>
                      <td className="fw-bold">{m.nome}</td>
                      <td>{m.telefone}</td>
                      <td><span className="badge bg-light text-dark border">{m.username}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(m.id!)}>
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {monitoras.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">Nenhuma monitora cadastrada.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {modo === 'CADASTRO' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
             <h5 className="fw-bold text-secondary mb-0">Cadastro de Monitora</h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSalvar}>
              
              <h6 className="fw-bold text-primary mb-3"><User size={18} className="me-1"/> Dados Pessoais</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Nome Completo</label>
                  <input className="form-control" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label">CPF</label>
                  <input className="form-control" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input className="form-control" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Endereço</label>
                  <input className="form-control" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})}/>
                </div>
              </div>

              <h6 className="fw-bold text-primary mb-3"><Key size={18} className="me-1"/> Dados de Acesso (Login)</h6>
              <div className="row g-3 mb-4 bg-light p-3 rounded border">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Usuário de Login *</label>
                  <input className="form-control" required placeholder="Ex: maria.monitora" value={form.username} onChange={e => setForm({...form, username: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Senha de Acesso *</label>
                  <input type="password" className="form-control" required placeholder="******" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})}/>
                </div>
                <small className="text-muted">Este usuário terá acesso ao perfil <strong>MONITORA</strong> automaticamente.</small>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>
                  {loading ? 'Salvando...' : 'Cadastrar Monitora e Criar Acesso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}