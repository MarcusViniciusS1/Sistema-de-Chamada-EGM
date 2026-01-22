import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash, Search, User, Cake } from 'lucide-react';

interface Aluno {
  id: number;
  nomeCompleto: string;
  matricula: string;
  sexo: string;
  idade: number;
  tipoAlimentar: string;
  alergias: string;
  deficiencia: string;
  enderecoResidencial: string;
  parada?: { id: number; nomeParada: string };
}

export function GestaoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado da Busca
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    matricula: '',
    sexo: 'M',
    idade: 0,
    tipoAlimentar: 'NORMAL',
    alergias: '',
    deficiencia: '',
    enderecoResidencial: '',
    paradaId: ''
  });

  const [listaParadas, setListaParadas] = useState<any[]>([]);

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
      setListaParadas(resParadas.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parada: formData.paradaId ? { id: Number(formData.paradaId) } : null
      };

      if (editandoId) {
        await axios.put(`http://localhost:8080/api/alunos/${editandoId}`, payload);
        alert("Aluno atualizado com sucesso!");
      } else {
        await axios.post('http://localhost:8080/api/alunos', payload);
        alert("Aluno cadastrado com sucesso!");
      }
      
      fecharModal();
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar aluno.");
    }
  };

  const deletarAluno = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        await axios.delete(`http://localhost:8080/api/alunos/${id}`);
        carregarDados();
      } catch (error) {
        alert("Erro ao deletar.");
      }
    }
  };

  const abrirModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditandoId(aluno.id);
      setFormData({
        nomeCompleto: aluno.nomeCompleto,
        matricula: aluno.matricula,
        sexo: aluno.sexo,
        idade: aluno.idade,
        tipoAlimentar: aluno.tipoAlimentar,
        alergias: aluno.alergias,
        deficiencia: aluno.deficiencia,
        enderecoResidencial: aluno.enderecoResidencial,
        paradaId: aluno.parada?.id.toString() || ''
      });
    } else {
      setEditandoId(null);
      setFormData({
        nomeCompleto: '',
        matricula: '',
        sexo: 'M',
        idade: 0,
        tipoAlimentar: 'NORMAL',
        alergias: '',
        deficiencia: '',
        enderecoResidencial: '',
        paradaId: ''
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  // --- LÓGICA DE FILTRAGEM ---
  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nomeCompleto.toLowerCase().includes(termoBusca.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(termoBusca.toLowerCase()) ||
    aluno.id.toString().includes(termoBusca)
  );

  return (
    <div className="container-fluid" style={{maxWidth: '1200px'}}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 className="text-white fw-bold mb-1">Gestão de Alunos</h3>
            <p className="text-muted small">Cadastro e edição de estudantes</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={() => abrirModal()}>
          <Plus size={20} className="me-2"/> Novo Aluno
        </button>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="card bg-dark border-secondary shadow-sm mb-4">
        <div className="card-body p-3">
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-muted"><Search size={20}/></span>
                <input 
                    type="text" 
                    className="form-control bg-dark border-secondary text-white" 
                    placeholder="Pesquisar por Nome, Matrícula ou ID..." 
                    value={termoBusca}
                    onChange={e => setTermoBusca(e.target.value)}
                />
            </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-5">Carregando...</div>
      ) : (
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="bg-secondary bg-opacity-25">
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Nome do Aluno</th>
                  <th className="py-3">Matrícula</th>
                  <th className="py-3">Idade</th> {/* ALTERADO AQUI */}
                  <th className="py-3 text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                            {alunos.length === 0 ? "Nenhum aluno cadastrado." : "Nenhum aluno encontrado na busca."}
                        </td>
                    </tr>
                ) : (
                    alunosFiltrados.map(aluno => (
                    <tr key={aluno.id}>
                        <td className="ps-4 text-muted">#{aluno.id}</td>
                        <td>
                            <div className="d-flex align-items-center">
                                <div className="bg-secondary bg-opacity-50 p-2 rounded-circle me-3">
                                    <User size={16} className="text-white"/>
                                </div>
                                <div>
                                    <div className="fw-bold">{aluno.nomeCompleto}</div>
                                    <small className="text-muted">{aluno.tipoAlimentar}</small>
                                </div>
                            </div>
                        </td>
                        <td><span className="badge bg-secondary">{aluno.matricula}</span></td>
                        
                        {/* COLUNA IDADE */}
                        <td>
                            <div className="d-flex align-items-center text-light">
                                <Cake size={14} className="me-2 text-warning"/>
                                <span className="fw-bold me-1">{aluno.idade}</span> anos
                            </div>
                        </td>

                        <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-light me-2" onClick={() => abrirModal(aluno)}>
                            <Edit size={16}/>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deletarAluno(aluno.id)}>
                            <Trash size={16}/>
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {modalAberto && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">
                    {editandoId ? 'Editar Aluno' : 'Novo Aluno'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={fecharModal}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={salvarAluno}>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label">Nome Completo</label>
                            <input className="form-control bg-secondary border-0 text-white" required 
                                value={formData.nomeCompleto} onChange={e => setFormData({...formData, nomeCompleto: e.target.value})}/>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Matrícula</label>
                            <input className="form-control bg-secondary border-0 text-white" required 
                                value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})}/>
                        </div>
                        
                        <div className="col-md-4">
                            <label className="form-label">Tipo Alimentar</label>
                            <select className="form-select bg-secondary border-0 text-white" 
                                value={formData.tipoAlimentar} onChange={e => setFormData({...formData, tipoAlimentar: e.target.value})}>
                                <option value="NORMAL">Normal</option>
                                <option value="DIETA_LIVRE">Dieta Livre</option>
                                <option value="PASTOSA">Pastosa</option>
                                <option value="SONDA">Sonda</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Idade</label>
                            <input type="number" className="form-control bg-secondary border-0 text-white" 
                                value={formData.idade} onChange={e => setFormData({...formData, idade: Number(e.target.value)})}/>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Sexo</label>
                            <select className="form-select bg-secondary border-0 text-white" 
                                value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label">Endereço Residencial</label>
                            <input className="form-control bg-secondary border-0 text-white" 
                                value={formData.enderecoResidencial} onChange={e => setFormData({...formData, enderecoResidencial: e.target.value})}/>
                        </div>

                        <div className="col-12">
                            <label className="form-label">Vincular Parada (Rota)</label>
                            <select className="form-select bg-secondary border-0 text-white" 
                                value={formData.paradaId} onChange={e => setFormData({...formData, paradaId: e.target.value})}>
                                <option value="">Sem vínculo (Pai traz na escola)</option>
                                {listaParadas.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nomeParada} ({p.endereco})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Alergias</label>
                            <textarea className="form-control bg-secondary border-0 text-white" rows={2}
                                value={formData.alergias} onChange={e => setFormData({...formData, alergias: e.target.value})}/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Deficiências / Obs</label>
                            <textarea className="form-control bg-secondary border-0 text-white" rows={2}
                                value={formData.deficiencia} onChange={e => setFormData({...formData, deficiencia: e.target.value})}/>
                        </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-light" onClick={fecharModal}>Cancelar</button>
                        <button type="submit" className="btn btn-primary fw-bold px-4">Salvar Aluno</button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}