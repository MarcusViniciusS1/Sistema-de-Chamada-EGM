import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CheckCircle, AlertCircle, MapPin, Search, Edit, Trash2, UserPlus, List } from 'lucide-react';

interface Aluno {
  idSequencial?: number;
  matricula: string;
  nomeCompleto: string;
  sexo: string;
  idade: number | string;
  tipoAlimentar: string;
  enderecoResidencial: string;
  paradaId: number | string;
  alergias: string;
  deficiencia: string;
}

interface Parada { id: number; nomeParada: string; }

export function CadastroAluno() {
  // Controle de Abas (Lista ou Cadastro)
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  
  // Verifica se é ADMIN (Pegando do Login salvo)
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  // Estados
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  // Formulário
  const formInicial: Aluno = {
    matricula: '', nomeCompleto: '', sexo: 'Masculino', idade: '', 
    tipoAlimentar: 'Sem restrição', enderecoResidencial: '', 
    paradaId: '', alergias: '', deficiencia: ''
  };
  const [form, setForm] = useState<Aluno>(formInicial);
  const [idEdicao, setIdEdicao] = useState<number | null>(null);

  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    carregarAlunos();
    carregarParadas();
  }, []);

  const carregarAlunos = () => {
    axios.get('http://localhost:8080/api/alunos')
      .then(res => setAlunos(res.data))
      .catch(console.error);
  };

  const carregarParadas = () => {
    axios.get('http://localhost:8080/api/paradas')
      .then(res => setParadas(res.data))
      .catch(console.error);
  };

  // --- AÇÕES DO SISTEMA ---

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        idade: Number(form.idade),
        paradaId: form.paradaId ? Number(form.paradaId) : null
      };

      if (idEdicao) {
        // Atualizar
        await axios.put(`http://localhost:8080/api/alunos/${idEdicao}`, payload);
        setMensagem({ tipo: 'sucesso', texto: 'Aluno atualizado com sucesso!' });
      } else {
        // Criar Novo
        await axios.post('http://localhost:8080/api/alunos', payload);
        setMensagem({ tipo: 'sucesso', texto: 'Aluno cadastrado com sucesso!' });
      }

      setForm(formInicial);
      setIdEdicao(null);
      carregarAlunos(); // Atualiza a lista
      setModo('LISTA'); // Volta pra tabela
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar dados.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (aluno: Aluno) => {
    setForm(aluno);
    setIdEdicao(aluno.idSequencial || null);
    setModo('CADASTRO');
    setMensagem({ tipo: '', texto: '' });
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/alunos/${id}`);
      carregarAlunos();
    } catch (error) {
      alert("Erro ao excluir. Verifique se o aluno tem registros de chamada.");
    }
  };

  const handleNovo = () => {
    setForm(formInicial);
    setIdEdicao(null);
    setModo('CADASTRO');
    setMensagem({ tipo: '', texto: '' });
  };

  // Filtro de Pesquisa
  const alunosFiltrados = alunos.filter(a => 
    a.nomeCompleto.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    a.matricula.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center my-4">
        <h3 className="fw-bold text-primary">Gestão de Alunos</h3>
        {modo === 'LISTA' && isAdmin && (
          <button className="btn btn-primary fw-bold" onClick={handleNovo}>
            <UserPlus size={18} className="me-2"/> Novo Aluno
          </button>
        )}
        {modo === 'CADASTRO' && (
          <button className="btn btn-outline-secondary fw-bold" onClick={() => setModo('LISTA')}>
            <List size={18} className="me-2"/> Voltar para Lista
          </button>
        )}
      </div>

      {/* MODO LISTA (PESQUISA E TABELA) */}
      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            
            {/* Barra de Pesquisa */}
            <div className="input-group mb-4">
              <span className="input-group-text bg-white"><Search size={18} className="text-muted"/></span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Pesquisar por Nome ou Matrícula..." 
                value={termoPesquisa}
                onChange={e => setTermoPesquisa(e.target.value)}
              />
            </div>

            {/* Tabela */}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>Idade</th>
                    <th>Tipo Alimentar</th>
                    {isAdmin && <th className="text-end">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {alunosFiltrados.map(aluno => (
                    <tr key={aluno.idSequencial}>
                      <td><span className="badge bg-light text-dark border">{aluno.matricula}</span></td>
                      <td className="fw-bold">{aluno.nomeCompleto}</td>
                      <td>{aluno.idade} anos</td>
                      <td>{aluno.tipoAlimentar}</td>
                      {isAdmin && (
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(aluno)}>
                            <Edit size={16}/>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(aluno.idSequencial!)}>
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {alunosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">Nenhum aluno encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODO CADASTRO (FORMULÁRIO) */}
      {modo === 'CADASTRO' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
             <h5 className="mb-0 fw-bold text-secondary">
               {idEdicao ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
             </h5>
          </div>
          <div className="card-body p-4">
            {mensagem.texto && (
              <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'}`}>
                {mensagem.texto}
              </div>
            )}
            
            <form onSubmit={handleSalvar}>
              <div className="row g-3">
                <div className="col-md-3">
                    <label className="form-label">Matrícula</label>
                    <input type="text" className="form-control" value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})} required />
                </div>
                <div className="col-md-9">
                    <label className="form-label">Nome Completo</label>
                    <input type="text" className="form-control" value={form.nomeCompleto} onChange={e => setForm({...form, nomeCompleto: e.target.value})} required />
                </div>
                {/* ... (Resto dos campos iguais ao anterior) ... */}
                <div className="col-md-4">
                    <label className="form-label">Idade</label>
                    <input type="number" className="form-control" value={form.idade} onChange={e => setForm({...form, idade: e.target.value})} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sexo</label>
                  <select className="form-select" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                    <option>Masculino</option><option>Feminino</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo Alimentar</label>
                  <select className="form-select" value={form.tipoAlimentar} onChange={e => setForm({...form, tipoAlimentar: e.target.value})}>
                      <option>Sem restrição</option><option>Vegetariano</option><option>Diabético</option><option>Pastoso</option><option>Com Restrição</option>
                  </select>
                </div>
                <div className="col-12">
                   <label className="form-label">Endereço</label>
                   <input type="text" className="form-control" value={form.enderecoResidencial} onChange={e => setForm({...form, enderecoResidencial: e.target.value})} required />
                </div>
                <div className="col-12">
                   <label className="form-label">Parada de Embarque</label>
                   <select className="form-select" value={form.paradaId} onChange={e => setForm({...form, paradaId: e.target.value})} required>
                      <option value="">Selecione...</option>
                      {paradas.map(p => <option key={p.id} value={p.id}>{p.nomeParada}</option>)}
                   </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Alergias</label>
                    <input type="text" className="form-control" value={form.alergias} onChange={e => setForm({...form, alergias: e.target.value})} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Deficiência</label>
                    <input type="text" className="form-control" value={form.deficiencia} onChange={e => setForm({...form, deficiencia: e.target.value})} />
                </div>

                <div className="col-12 text-end mt-4">
                  <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Dados'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}