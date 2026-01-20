import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

// Tipagem para a Parada
interface Parada {
  id: number;
  nomeParada: string;
}

export function CadastroAluno() {
  // Estado do formulário
  const [form, setForm] = useState({
    matricula: '', // NOVO CAMPO
    nomeCompleto: '',
    sexo: 'Masculino',
    idade: '',
    tipoAlimentar: 'Sem restrição',
    enderecoResidencial: '',
    paradaId: '', 
    alergias: '',
    deficiencia: ''
  });

  // Estado para armazenar a lista de paradas que vem do banco
  const [listaParadas, setListaParadas] = useState<Parada[]>([]);
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  // Busca as paradas assim que a tela abre
  useEffect(() => {
    axios.get('http://localhost:8080/api/paradas')
      .then(res => setListaParadas(res.data))
      .catch(err => console.error("Erro ao carregar paradas:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const dadosParaEnviar = {
        ...form,
        idade: parseInt(form.idade),
        paradaId: form.paradaId ? parseInt(form.paradaId) : null
      };

      await axios.post('http://localhost:8080/api/alunos', dadosParaEnviar);
      
      setMensagem({ tipo: 'sucesso', texto: 'Aluno cadastrado com sucesso!' });
      setForm({
        matricula: '', nomeCompleto: '', sexo: 'Masculino', idade: '', 
        tipoAlimentar: 'Sem restrição', enderecoResidencial: '', 
        paradaId: '', alergias: '', deficiencia: ''
      });

    } catch (erro) {
      console.error(erro);
      setMensagem({ tipo: 'erro', texto: 'Erro ao cadastrar. Verifique o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white py-3 border-bottom-0">
          <h4 className="mb-0 fw-bold text-primary d-flex align-items-center">
            <Save size={24} className="me-2" /> Cadastro de Aluno
          </h4>
        </div>

        <div className="card-body p-4">
          {mensagem.texto && (
            <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`} role="alert">
              {mensagem.tipo === 'sucesso' ? <CheckCircle className="me-2"/> : <AlertCircle className="me-2"/>}
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              
              {/* NOVO CAMPO: ID / Matrícula */}
              <div className="col-md-3">
                <label className="form-label fw-bold text-secondary">ID (Matrícula) *</label>
                <input 
                  type="text" 
                  name="matricula"
                  className="form-control" 
                  placeholder="Ex: 001" 
                  value={form.matricula}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="col-md-9">
                <label className="form-label fw-bold text-secondary">Nome Completo *</label>
                <input 
                  type="text" 
                  name="nomeCompleto"
                  className="form-control" 
                  placeholder="Ex: João da Silva" 
                  value={form.nomeCompleto}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold text-secondary">Idade *</label>
                <input 
                  type="number" 
                  name="idade"
                  className="form-control" 
                  value={form.idade}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-bold text-secondary">Sexo *</label>
                <select name="sexo" className="form-select" value={form.sexo} onChange={handleChange}>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold text-secondary">Tipo Alimentar *</label>
                <select name="tipoAlimentar" className="form-select" value={form.tipoAlimentar} onChange={handleChange}>
                    <option value="Sem restrição">Sem restrição</option>
                    <option value="Vegetariano">Vegetariano</option>
                    <option value="Diabético">Diabético</option>
                    <option value="Pastoso">Pastoso</option>
                    <option value="Com Restrição">Com Restrição</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold text-secondary">Endereço Residencial *</label>
                <input 
                  type="text" 
                  name="enderecoResidencial"
                  className="form-control" 
                  placeholder="Rua, número, bairro..." 
                  value={form.enderecoResidencial}
                  onChange={handleChange}
                  required 
                />
              </div>

              {/* CAMPO DE PARADA AGORA É UM SELECT DINÂMICO */}
              <div className="col-md-12">
                <label className="form-label fw-bold text-secondary d-flex align-items-center">
                  <MapPin size={16} className="me-1"/> Parada de Embarque *
                </label>
                <select 
                  name="paradaId" 
                  className="form-select" 
                  value={form.paradaId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma parada...</option>
                  {listaParadas.length === 0 && <option disabled>Carregando paradas...</option>}
                  
                  {listaParadas.map((parada) => (
                    <option key={parada.id} value={parada.id}>
                      {parada.nomeParada} (ID: {parada.id})
                    </option>
                  ))}
                </select>
                {listaParadas.length === 0 && (
                  <small className="text-danger">
                    Nenhuma parada encontrada. Cadastre uma parada ou verifique o banco de dados.
                  </small>
                )}
              </div>

              <hr className="my-4 text-muted" />
              <h6 className="text-muted text-uppercase mb-3">Informações de Saúde (Opcional)</h6>

              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Alergias</label>
                <input type="text" name="alergias" className="form-control" value={form.alergias} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Deficiência</label>
                <input type="text" name="deficiencia" className="form-control" value={form.deficiencia} onChange={handleChange} />
              </div>

              <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
                  {loading ? 'Salvando...' : 'Cadastrar Aluno'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}