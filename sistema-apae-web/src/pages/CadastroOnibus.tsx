import React, { useState } from 'react';
import axios from 'axios';
import { Bus, MapPin, Plus, Trash2, CheckCircle, AlertCircle, Save } from 'lucide-react';

// Interfaces para tipagem
interface ParadaTemp {
  nomeParada: string;
  endereco: string;
  latitude: string;
  longitude: string;
}

export function CadastroOnibus() {
  // Estado do Ônibus
  const [formBus, setFormBus] = useState({
    nomeOnibus: '',
    nomeMotorista: '',
    placa: '',
    cor: '',
    capacidadeMaxima: '',
    suportaDeficiente: false
  });

  // Estado da Parada (temporário, enquanto digita)
  const [formParada, setFormParada] = useState<ParadaTemp>({
    nomeParada: '', endereco: '', latitude: '', longitude: ''
  });

  // Lista de paradas adicionadas visualmente
  const [listaParadas, setListaParadas] = useState<ParadaTemp[]>([]);
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  // --- Funções de Manipulação ---

  // Adiciona a parada na lista visual (tabela abaixo)
  const adicionarParada = () => {
    if (!formParada.nomeParada || !formParada.endereco) {
      alert("Preencha pelo menos Nome e Endereço da parada.");
      return;
    }
    setListaParadas([...listaParadas, formParada]);
    setFormParada({ nomeParada: '', endereco: '', latitude: '', longitude: '' }); // Limpa campos da parada
  };

  // Remove uma parada da lista visual
  const removerParada = (index: number) => {
    const novaLista = listaParadas.filter((_, i) => i !== index);
    setListaParadas(novaLista);
  };

  // Envia TUDO para o Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const dadosCompletos = {
        ...formBus,
        capacidadeMaxima: parseInt(formBus.capacidadeMaxima),
        paradas: listaParadas // O Java vai salvar isso automaticamente graças ao Cascade
      };

      await axios.post('http://localhost:8080/api/onibus', dadosCompletos);
      
      setMensagem({ tipo: 'sucesso', texto: 'Ônibus e paradas cadastrados com sucesso!' });
      
      // Limpar tudo
      setFormBus({ nomeOnibus: '', nomeMotorista: '', placa: '', cor: '', capacidadeMaxima: '', suportaDeficiente: false });
      setListaParadas([]);

    } catch (erro) {
      console.error(erro);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Verifique o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      
      {/* Cabeçalho */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white py-3 border-bottom-0">
          <div className="d-flex align-items-center">
            <div className="bg-success text-white rounded p-2 me-3">
              <Bus size={24} />
            </div>
            <div>
              <h4 className="mb-0 fw-bold text-dark">Cadastro de Ônibus</h4>
              <small className="text-muted">Adicione um novo ônibus e configure sua rota</small>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          
          {mensagem.texto && (
            <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* --- SEÇÃO 1: DADOS DO ÔNIBUS --- */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Nome do Ônibus *</label>
                <input 
                  type="text" className="form-control" placeholder="Ex: Ônibus Esperança" 
                  value={formBus.nomeOnibus}
                  onChange={e => setFormBus({...formBus, nomeOnibus: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Nome do Motorista *</label>
                <input 
                  type="text" className="form-control" placeholder="Ex: João Silva" 
                  value={formBus.nomeMotorista}
                  onChange={e => setFormBus({...formBus, nomeMotorista: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Placa *</label>
                <input 
                  type="text" className="form-control" placeholder="Ex: ABC-1234" 
                  value={formBus.placa}
                  onChange={e => setFormBus({...formBus, placa: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Cor *</label>
                <select 
                  className="form-select"
                  value={formBus.cor}
                  onChange={e => setFormBus({...formBus, cor: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Amarelo">Amarelo</option>
                  <option value="Branco">Branco</option>
                  <option value="Azul">Azul</option>
                  <option value="Prata">Prata</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-secondary">Capacidade Máxima *</label>
                <input 
                  type="number" className="form-control" 
                  value={formBus.capacidadeMaxima}
                  onChange={e => setFormBus({...formBus, capacidadeMaxima: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 d-flex align-items-center pt-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" type="checkbox" id="deficienteCheck"
                    checked={formBus.suportaDeficiente}
                    onChange={e => setFormBus({...formBus, suportaDeficiente: e.target.checked})}
                  />
                  <label className="form-check-label fw-bold" htmlFor="deficienteCheck">
                    Suporte a pessoas com deficiência
                  </label>
                </div>
              </div>
            </div>

            <hr className="my-5" />

            {/* --- SEÇÃO 2: CONFIGURAÇÃO DA ROTA (ADICIONAR PARADAS) --- */}
            <h5 className="mb-3 fw-bold d-flex align-items-center">
              <MapPin size={20} className="me-2"/> Configuração da Rota
            </h5>

            <div className="card bg-light border p-3 mb-3">
              <h6 className="fw-bold text-secondary mb-3">Adicionar Nova Parada</h6>
              <div className="row g-2">
                <div className="col-12">
                  <input 
                    type="text" className="form-control" placeholder="Nome da Parada *" 
                    value={formParada.nomeParada}
                    onChange={e => setFormParada({...formParada, nomeParada: e.target.value})}
                  />
                </div>
                <div className="col-12">
                  <input 
                    type="text" className="form-control" placeholder="Endereço *" 
                    value={formParada.endereco}
                    onChange={e => setFormParada({...formParada, endereco: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input 
                    type="text" className="form-control" placeholder="Latitude (Ex: -23.55)" 
                    value={formParada.latitude}
                    onChange={e => setFormParada({...formParada, latitude: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input 
                    type="text" className="form-control" placeholder="Longitude (Ex: -46.63)" 
                    value={formParada.longitude}
                    onChange={e => setFormParada({...formParada, longitude: e.target.value})}
                  />
                </div>
                <div className="col-12 mt-3">
                  <button type="button" className="btn btn-secondary w-100 fw-bold" onClick={adicionarParada}>
                    <Plus size={18} className="me-1"/> Adicionar Parada
                  </button>
                </div>
              </div>
            </div>

            {/* Lista visual das paradas adicionadas */}
            {listaParadas.length > 0 && (
              <div className="table-responsive mb-4">
                <table className="table table-bordered table-hover bg-white">
                  <thead className="table-light">
                    <tr>
                      <th>Ordem</th>
                      <th>Nome da Parada</th>
                      <th>Endereço</th>
                      <th className="text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaParadas.map((p, index) => (
                      <tr key={index}>
                        <td>{index + 1}º</td>
                        <td>{p.nomeParada}</td>
                        <td>{p.endereco}</td>
                        <td className="text-center">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => removerParada(index)}
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- BOTÕES FINAIS --- */}
            <div className="d-flex gap-2 pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary px-4 fw-bold">
                    Limpar
                </button>
                <button type="submit" className="btn btn-secondary px-4 fw-bold w-100" disabled={loading}>
                    {loading ? 'Salvando...' : 'Cadastrar Ônibus'}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}