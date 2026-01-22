import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit, Save, X, Search } from 'lucide-react';

interface Parada {
  id: number;
  nomeParada: string;
}

interface Aluno {
  id?: number;
  matricula: string;
  nomeCompleto: string;
  sexo: string;
  idade: number;
  parada?: Parada;
  tipoAlimentar: string;
  enderecoResidencial: string;
  alergias: string;
  deficiencia: string;
}

export function GestaoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const [loading, setLoading] = useState(false);
  
  // Estado do Formulário
  const formInicial: Aluno = {
    matricula: '',
    nomeCompleto: '',
    sexo: 'Masculino',
    idade: 6,
    tipoAlimentar: 'Sem restrição',
    enderecoResidencial: '',
    alergias: '',
    deficiencia: '',
    parada: undefined
  };
  const [form, setForm] = useState<Aluno>(formInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resAlunos, resParadas] = await Promise.all([
        axios.get('http://localhost:8080/api/alunos'),
        axios.get('http://localhost:8080/api/paradas')
      ]);
      setAlunos(resAlunos.data);
      setParadas(resParadas.data);
    } catch (error) { console.error("Erro ao carregar", error); }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await axios.put(`http://localhost:8080/api/alunos/${form.id}`, form);
        alert("Aluno atualizado!");
      } else {
        await axios.post('http://localhost:8080/api/alunos', form);
        alert("Aluno cadastrado!");
      }
      setModo('LISTA');
      setForm(formInicial);
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar. Verifique se o ID já existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await axios.delete(`http://localhost:8080/api/alunos/${id}`);
        carregarDados();
      } catch (e) { alert("Erro ao excluir."); }
    }
  };

  const handleEditar = (aluno: Aluno) => {
    setForm(aluno);
    setModo('CADASTRO');
  };

  return (
    <div className="container py-4" style={{maxWidth: '1000px'}}>
      
      {/* TÍTULO E BOTÃO NOVO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-white fw-bold mb-0">Gestão de Alunos</h3>
        {modo === 'LISTA' && (
          <button className="btn btn-primary fw-bold" onClick={() => { setForm(formInicial); setModo('CADASTRO'); }}>
            <UserPlus size={18} className="me-2"/> Novo Aluno
          </button>
        )}
      </div>

      {/* --- MODO CADASTRO (FORMULÁRIO IDÊNTICO À FOTO) --- */}
      {modo === 'CADASTRO' && (
        <div className="card border-0 shadow-sm" style={{background: '#fff'}}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-1 text-dark">
              <span className="bg-primary text-white rounded p-1 me-2"><UserPlus size={20}/></span>
              {form.id ? 'Editar Aluno' : 'Cadastro de Aluno'}
            </h5>
            <p className="text-muted small mb-4">Adicione ou edite as informações do aluno no sistema</p>

            <form onSubmit={handleSalvar}>
              <div className="row g-3">
                
                {/* LINHA 1: ID e Nome */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">ID do Aluno *</label>
                  <input type="text" className="form-control" placeholder="Ex: joao_001" required 
                    value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Nome Completo *</label>
                  <input type="text" className="form-control" placeholder="Digite o nome completo do aluno" required 
                    value={form.nomeCompleto} onChange={e => setForm({...form, nomeCompleto: e.target.value})}/>
                </div>

                {/* LINHA 2: Sexo e Idade */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Sexo *</label>
                  <select className="form-select" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Idade *</label>
                  <input type="number" className="form-control" placeholder="6" required 
                    value={form.idade} onChange={e => setForm({...form, idade: Number(e.target.value)})}/>
                </div>

                {/* LINHA 3: Parada e Tipo Alimentar */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Parada de Embarque *</label>
                  <select className="form-select" required
                    value={form.parada?.id || ''} 
                    onChange={e => {
                        const selecionada = paradas.find(p => p.id === Number(e.target.value));
                        setForm({...form, parada: selecionada});
                    }}>
                    <option value="">Selecione uma parada</option>
                    {paradas.map(p => <option key={p.id} value={p.id}>{p.nomeParada}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Tipo Alimentar *</label>
                  <select className="form-select" value={form.tipoAlimentar} onChange={e => setForm({...form, tipoAlimentar: e.target.value})}>
                    <option value="Sem restrição">Sem restrição</option>
                    <option value="Vegetariano">Vegetariano</option>
                    <option value="Diabético">Diabético</option>
                    <option value="Pastoso">Pastoso</option>
                    <option value="Com Restrição">Com Restrição (Outros)</option>
                  </select>
                </div>

                {/* LINHA 4: Endereço */}
                <div className="col-12">
                  <label className="form-label fw-bold text-secondary small">Endereço Residencial *</label>
                  <input type="text" className="form-control" placeholder="Rua, número, bairro, cidade" required 
                    value={form.enderecoResidencial} onChange={e => setForm({...form, enderecoResidencial: e.target.value})}/>
                </div>

                {/* LINHA 5: Alergias e Deficiência */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Alergias (opcional)</label>
                  <input type="text" className="form-control" placeholder="Ex: Lactose, Glúten, Amendoim" 
                    value={form.alergias} onChange={e => setForm({...form, alergias: e.target.value})}/>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small">Deficiência (opcional)</label>
                  <input type="text" className="form-control" placeholder="Descreva se possui alguma deficiência" 
                    value={form.deficiencia} onChange={e => setForm({...form, deficiencia: e.target.value})}/>
                </div>

              </div>

              {/* BOTÕES */}
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setForm(formInicial)}>
                    <X size={18} className="me-2"/> Limpar
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-bold w-100" disabled={loading}>
                    <Save size={18} className="me-2"/> {loading ? 'Salvando...' : (form.id ? 'Atualizar Aluno' : 'Cadastrar Aluno')}
                </button>
                <button type="button" className="btn btn-link text-muted ms-auto" onClick={() => setModo('LISTA')}>Cancelar</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODO LISTA --- */}
      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm overflow-hidden" style={{background: '#1e293b'}}>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-secondary text-secondary small text-uppercase">
                  <th className="ps-4 py-3">Nome do Aluno</th>
                  <th>ID</th>
                  <th>Idade</th>
                  <th>Alimentação</th>
                  <th className="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map(aluno => (
                  <tr key={aluno.id} className="border-secondary">
                    <td className="ps-4 fw-bold">{aluno.nomeCompleto}</td>
                    <td><span className="badge bg-secondary text-white">{aluno.matricula}</span></td>
                    <td>{aluno.idade} anos</td>
                    <td>{aluno.tipoAlimentar}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditar(aluno)}>
                        <Edit size={16}/>
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleExcluir(aluno.id!)}>
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
                {alunos.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted">Nenhum aluno encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}