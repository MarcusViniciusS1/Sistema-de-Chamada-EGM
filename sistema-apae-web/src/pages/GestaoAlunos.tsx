import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Edit, GraduationCap } from 'lucide-react';

interface Aluno {
  id?: number;
  nomeCompleto: string;
  matricula: string;
  idade: number;
  tipoAlimentar: string;
}

export function GestaoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const [idEdicao, setIdEdicao] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const formInicial = { nomeCompleto: '', matricula: '', idade: 0, tipoAlimentar: 'Sem restrição' };
  const [form, setForm] = useState(formInicial);

  useEffect(() => { carregarAlunos(); }, []);

  const carregarAlunos = async () => {
    try {
        const res = await axios.get('http://localhost:8080/api/alunos');
        setAlunos(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (idEdicao) {
        await axios.put(`http://localhost:8080/api/alunos/${idEdicao}`, form);
      } else {
        await axios.post('http://localhost:8080/api/alunos', form);
      }
      setModo('LISTA');
      setForm(formInicial);
      setIdEdicao(null);
      carregarAlunos();
      alert("Salvo com sucesso!");
    } catch (error) {
      alert('Erro ao salvar aluno.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (aluno: Aluno) => {
    setForm(aluno);
    setIdEdicao(aluno.id || null);
    setModo('CADASTRO');
  };

  const handleExcluir = async (id: number) => {
    if (confirm('Excluir aluno?')) {
      await axios.delete(`http://localhost:8080/api/alunos/${id}`);
      carregarAlunos();
    }
  };

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h3 className="fw-bold d-flex align-items-center">
            <GraduationCap className="me-2 text-primary"/> Gestão de Alunos
        </h3>
        {modo === 'LISTA' ? (
          <button className="btn btn-primary" onClick={() => { setForm(formInicial); setModo('CADASTRO'); }}>
            <Plus size={18} className="me-2"/> Novo Aluno
          </button>
        ) : (
          <button className="btn btn-outline-secondary" onClick={() => setModo('LISTA')}>Voltar</button>
        )}
      </div>

      {modo === 'LISTA' && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Nome</th>
                  <th>Matrícula</th>
                  <th>Idade</th>
                  <th>Alimentação</th>
                  <th className="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map(a => (
                  <tr key={a.id}>
                    <td className="ps-4 fw-bold">{a.nomeCompleto}</td>
                    <td><span className="badge bg-light text-dark border">{a.matricula}</span></td>
                    <td>{a.idade} anos</td>
                    <td>{a.tipoAlimentar}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(a)}><Edit size={16}/></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(a.id!)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modo === 'CADASTRO' && (
        <div className="card shadow-sm border-0 p-4">
          <form onSubmit={handleSalvar} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome Completo</label>
              <input className="form-control" required value={form.nomeCompleto} onChange={e => setForm({...form, nomeCompleto: e.target.value})}/>
            </div>
            <div className="col-md-3">
              <label className="form-label">Matrícula</label>
              <input className="form-control" required value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})}/>
            </div>
            <div className="col-md-3">
              <label className="form-label">Idade</label>
              <input type="number" className="form-control" required value={form.idade} onChange={e => setForm({...form, idade: Number(e.target.value)})}/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tipo Alimentar</label>
              <select className="form-select" value={form.tipoAlimentar} onChange={e => setForm({...form, tipoAlimentar: e.target.value})}>
                <option>Sem restrição</option>
                <option>Vegetariano</option>
                <option>Diabético</option>
                <option>Pastoso</option>
                <option>Com Restrição</option>
              </select>
            </div>
            <div className="col-12 text-end">
              <button className="btn btn-success px-4" disabled={loading}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}