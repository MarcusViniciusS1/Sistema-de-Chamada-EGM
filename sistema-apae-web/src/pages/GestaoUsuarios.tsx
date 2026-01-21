import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCog, Trash2, Plus, Edit, Save, Shield, User, Key, Bus } from 'lucide-react';

interface Onibus {
  id: number;
  nomeOnibus: string;
  placa: string;
}

interface Usuario {
  id?: number;
  nome: string;
  username: string;
  senha?: string;
  perfil: string;
  onibus?: Onibus | null; // Novo campo
}

export function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [listaOnibus, setListaOnibus] = useState<Onibus[]>([]); // Lista para o dropdown
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const [loading, setLoading] = useState(false);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  // Form agora guarda o ID do ônibus selecionado
  const formInicial = { nome: '', username: '', senha: '', perfil: 'MONITOR', onibusId: '' };
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    carregarUsuarios();
    carregarOnibus(); // Busca os ônibus ao abrir a tela
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/usuarios');
      setUsuarios(res.data);
    } catch (error) { console.error(error); }
  };

  const carregarOnibus = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/onibus');
      setListaOnibus(res.data);
    } catch (error) { console.error("Erro ao buscar ônibus", error); }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepara o objeto para enviar ao Java
    const dadosParaEnviar = {
        nome: form.nome,
        username: form.username,
        senha: form.senha,
        perfil: form.perfil,
        // Se tiver ID de ônibus, manda o objeto completo, senão manda null
        onibus: form.onibusId ? { id: Number(form.onibusId) } : null
    };
    
    try {
      if (idEdicao) {
        await axios.put(`http://localhost:8080/api/usuarios/${idEdicao}`, dadosParaEnviar);
        alert("Usuário atualizado!");
      } else {
        await axios.post('http://localhost:8080/api/usuarios', dadosParaEnviar);
        alert("Usuário criado com sucesso!");
      }
      
      limparForm();
      carregarUsuarios();
      setModo('LISTA');
    } catch (error) {
      alert("Erro ao salvar. Verifique se o login já existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (user: Usuario) => {
    setForm({
      nome: user.nome,
      username: user.username,
      senha: '', 
      perfil: user.perfil,
      onibusId: user.onibus ? String(user.onibus.id) : ''
    });
    setIdEdicao(user.id || null);
    setModo('CADASTRO');
  };

  const handleExcluir = async (id: number) => {
    if(!window.confirm("Tem certeza que deseja apagar este usuário?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/usuarios/${id}`);
      carregarUsuarios();
    } catch (e) { alert("Erro ao excluir"); }
  };

  const limparForm = () => {
    setForm(formInicial);
    setIdEdicao(null);
  };

  const getBadgePerfil = (perfil: string) => {
    switch(perfil) {
      case 'ADMIN': return <span className="badge bg-dark">ADMIN</span>;
      case 'MONITOR': return <span className="badge bg-success">MONITOR</span>;
      case 'PORTEIRO': return <span className="badge bg-primary">PORTEIRO</span>;
      case 'REFEITORIO': return <span className="badge bg-warning text-dark">REFEITÓRIO</span>;
      default: return <span className="badge bg-secondary">{perfil}</span>;
    }
  };

  if (!isAdmin) {
    return <div className="alert alert-danger m-4">Acesso Restrito</div>;
  }

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center my-4">
        <div>
          <h3 className="fw-bold text-dark d-flex align-items-center">
            <UserCog size={28} className="me-2 text-primary"/> Gestão de Usuários
          </h3>
          <p className="text-muted mb-0">Controle de acesso e vínculo de monitoras</p>
        </div>
        
        {modo === 'LISTA' && (
          <button className="btn btn-primary fw-bold px-4" onClick={() => { limparForm(); setModo('CADASTRO'); }}>
            <Plus size={18} className="me-2"/> Novo Usuário
          </button>
        )}
        {modo === 'CADASTRO' && (
          <button className="btn btn-outline-secondary px-4" onClick={() => { limparForm(); setModo('LISTA'); }}>
            Cancelar
          </button>
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
                    <th className="ps-4">Nome</th>
                    <th>Login</th>
                    <th>Perfil</th>
                    <th>Ônibus Responsável</th>
                    <th className="text-end pe-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td className="ps-4 fw-bold text-secondary">{u.nome}</td>
                      <td><code>{u.username}</code></td>
                      <td>{getBadgePerfil(u.perfil)}</td>
                      <td>
                        {u.onibus ? (
                            <span className="badge bg-light text-dark border">
                                <Bus size={12} className="me-1"/> {u.onibus.nomeOnibus}
                            </span>
                        ) : (
                            <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(u)}><Edit size={16}/></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(u.id!)}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && <tr><td colSpan={5} className="text-center py-5">Nenhum usuário cadastrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODO CADASTRO */}
      {modo === 'CADASTRO' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
             <h5 className="fw-bold text-secondary mb-0">
               {idEdicao ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
             </h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSalvar}>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Nome Completo</label>
                  <input className="form-control" required placeholder="Ex: Maria da Silva" 
                    value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}/>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Perfil de Acesso</label>
                  <select className="form-select" required value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})}>
                    <option value="MONITOR">Monitora (Ônibus)</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="PORTEIRO">Portaria</option>
                    <option value="REFEITORIO">Refeitório</option>
                  </select>
                </div>

                {/* CAMPO CONDICIONAL: SÓ APARECE SE FOR MONITORA */}
                {form.perfil === 'MONITOR' && (
                    <div className="col-12">
                        <div className="bg-light p-3 rounded border border-warning">
                            <label className="form-label fw-bold text-warning d-flex align-items-center">
                                <Bus size={18} className="me-2"/> Ônibus Responsável
                            </label>
                            <select 
                                className="form-select" 
                                required 
                                value={form.onibusId} 
                                onChange={e => setForm({...form, onibusId: e.target.value})}
                            >
                                <option value="">-- Selecione o ônibus --</option>
                                {listaOnibus.map(bus => (
                                    <option key={bus.id} value={bus.id}>
                                        {bus.nomeOnibus} ({bus.placa})
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted">Selecione qual ônibus esta monitora irá cuidar.</small>
                        </div>
                    </div>
                )}

                <div className="col-md-6">
                  <label className="form-label fw-bold">Login</label>
                  <input className="form-control" required 
                    value={form.username} onChange={e => setForm({...form, username: e.target.value})}/>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Senha</label>
                  <input type="password" className="form-control" placeholder={idEdicao ? "Manter atual" : "******"} 
                    value={form.senha} onChange={e => setForm({...form, senha: e.target.value})}/>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-success fw-bold px-5" disabled={loading}>
                  <Save size={18} className="me-2"/> {loading ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}