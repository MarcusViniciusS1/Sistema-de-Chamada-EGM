import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, Plus, Trash2, Search, Edit, List, MapPin } from 'lucide-react';

// Tipagem
interface ParadaTemp {
  id?: number; // Opcional, pois pode ser nova
  nomeParada: string;
  endereco: string;
  latitude: string;
  longitude: string;
}

interface Onibus {
  id?: number;
  nomeOnibus: string;
  nomeMotorista: string;
  placa: string;
  cor: string;
  capacidadeMaxima: string | number;
  suportaDeficiente: boolean;
  paradas: ParadaTemp[];
}

export function CadastroOnibus() {
  const [modo, setModo] = useState<'LISTA' | 'CADASTRO'>('LISTA');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  const [listaOnibus, setListaOnibus] = useState<Onibus[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');

  // Formulário
  const formInicial: Onibus = {
    nomeOnibus: '', nomeMotorista: '', placa: '', cor: '', 
    capacidadeMaxima: '', suportaDeficiente: false, paradas: []
  };
  const [formBus, setFormBus] = useState<Onibus>(formInicial);
  const [formParada, setFormParada] = useState<ParadaTemp>({ nomeParada: '', endereco: '', latitude: '', longitude: '' });
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    carregarOnibus();
  }, []);

  const carregarOnibus = () => {
    axios.get('http://localhost:8080/api/onibus')
      .then(res => setListaOnibus(res.data))
      .catch(console.error);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formBus, capacidadeMaxima: Number(formBus.capacidadeMaxima) };
      
      if (formBus.id) {
         await axios.put(`http://localhost:8080/api/onibus/${formBus.id}`, payload);
         setMensagem({ tipo: 'sucesso', texto: 'Ônibus atualizado!' });
      } else {
         await axios.post('http://localhost:8080/api/onibus', payload);
         setMensagem({ tipo: 'sucesso', texto: 'Ônibus cadastrado!' });
      }
      
      setFormBus(formInicial);
      carregarOnibus();
      setModo('LISTA');
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar.' });
    }
  };

  const handleEditar = (onibus: Onibus) => {
    setFormBus(onibus);
    setModo('CADASTRO');
    setMensagem({ tipo: '', texto: '' });
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Excluir este ônibus remove todas as suas paradas. Continuar?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/onibus/${id}`);
      carregarOnibus();
    } catch (e) { alert("Erro ao excluir."); }
  };

  // Funções de Parada (Local)
  const adicionarParada = () => {
    if (!formParada.nomeParada) return;
    setFormBus({ ...formBus, paradas: [...formBus.paradas, formParada] });
    setFormParada({ nomeParada: '', endereco: '', latitude: '', longitude: '' });
  };

  const removerParada = (index: number) => {
    const novas = formBus.paradas.filter((_, i) => i !== index);
    setFormBus({ ...formBus, paradas: novas });
  };

  const onibusFiltrados = listaOnibus.filter(o => 
    o.nomeOnibus.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
    o.placa.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      
      <div className="d-flex justify-content-between align-items-center my-4">
        <h3 className="fw-bold text-success">Gestão de Frota</h3>
        {modo === 'LISTA' && isAdmin && (
          <button className="btn btn-success fw-bold" onClick={() => { setFormBus(formInicial); setModo('CADASTRO'); }}>
            <Plus size={18} className="me-2"/> Novo Ônibus
          </button>
        )}
        {modo === 'CADASTRO' && (
          <button className="btn btn-outline-secondary" onClick={() => setModo('LISTA')}>
            <List size={18} className="me-2"/> Voltar
          </button>
        )}
      </div>

      {modo === 'LISTA' && (
        <div className="card border-0 shadow-sm">
           <div className="card-body">
             <div className="input-group mb-4">
               <span className="input-group-text bg-white"><Search size={18}/></span>
               <input type="text" className="form-control border-start-0" placeholder="Pesquisar Ônibus ou Placa..." value={termoPesquisa} onChange={e => setTermoPesquisa(e.target.value)}/>
             </div>
             
             <div className="table-responsive">
               <table className="table table-hover align-middle">
                 <thead className="table-light">
                   <tr>
                     <th>Nome</th>
                     <th>Placa</th>
                     <th>Motorista</th>
                     <th>Capacidade</th>
                     {isAdmin && <th className="text-end">Ações</th>}
                   </tr>
                 </thead>
                 <tbody>
                   {onibusFiltrados.map(bus => (
                     <tr key={bus.id}>
                       <td className="fw-bold text-success">{bus.nomeOnibus}</td>
                       <td><span className="badge bg-light text-dark border">{bus.placa}</span></td>
                       <td>{bus.nomeMotorista}</td>
                       <td>{bus.capacidadeMaxima}</td>
                       {isAdmin && (
                         <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(bus)}><Edit size={16}/></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(bus.id!)}><Trash2 size={16}/></button>
                         </td>
                       )}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {modo === 'CADASTRO' && (
         <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
               {mensagem.texto && <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'}`}>{mensagem.texto}</div>}
               <form onSubmit={handleSalvar}>
                 {/* ... Campos do ônibus (Pode copiar do anterior, só mude os valores para formBus.campo) ... */}
                 <div className="row g-3">
                    <div className="col-md-6"><label>Nome</label><input className="form-control" value={formBus.nomeOnibus} onChange={e => setFormBus({...formBus, nomeOnibus: e.target.value})} required/></div>
                    <div className="col-md-6"><label>Placa</label><input className="form-control" value={formBus.placa} onChange={e => setFormBus({...formBus, placa: e.target.value})} required/></div>
                    <div className="col-md-6"><label>Motorista</label><input className="form-control" value={formBus.nomeMotorista} onChange={e => setFormBus({...formBus, nomeMotorista: e.target.value})} required/></div>
                    <div className="col-md-6"><label>Cor</label><select className="form-select" value={formBus.cor} onChange={e => setFormBus({...formBus, cor: e.target.value})}><option>Amarelo</option><option>Branco</option></select></div>
                    <div className="col-md-6"><label>Capacidade</label><input type="number" className="form-control" value={formBus.capacidadeMaxima} onChange={e => setFormBus({...formBus, capacidadeMaxima: e.target.value})} required/></div>
                    <div className="col-md-6 pt-4"><input type="checkbox" checked={formBus.suportaDeficiente} onChange={e => setFormBus({...formBus, suportaDeficiente: e.target.checked})}/> Suporta Deficiente</div>
                 </div>

                 <hr className="my-4"/>
                 <h6 className="fw-bold"><MapPin size={18}/> Paradas</h6>
                 {/* Adição simplificada de paradas */}
                 <div className="input-group mb-2">
                    <input type="text" className="form-control" placeholder="Nome Parada" value={formParada.nomeParada} onChange={e => setFormParada({...formParada, nomeParada: e.target.value})}/>
                    <input type="text" className="form-control" placeholder="Endereço" value={formParada.endereco} onChange={e => setFormParada({...formParada, endereco: e.target.value})}/>
                    <button type="button" className="btn btn-secondary" onClick={adicionarParada}><Plus/></button>
                 </div>
                 <ul className="list-group mb-3">
                    {formBus.paradas.map((p, i) => (
                        <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                            {p.nomeParada} - {p.endereco}
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => removerParada(i)}><Trash2 size={12}/></button>
                        </li>
                    ))}
                 </ul>

                 <button type="submit" className="btn btn-success w-100 fw-bold">Salvar Dados</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}