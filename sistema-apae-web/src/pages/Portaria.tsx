import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle, AlertTriangle, XCircle, Search, Clock } from 'lucide-react';

interface HistoricoItem {
  hora: string;
  nome: string;
  status: 'SUCESSO' | 'ERRO' | 'DUPLICADO';
  mensagem: string;
}

export function Portaria() {
  const [termo, setTermo] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Contadores
  const [totalPresencasBanco, setTotalPresencasBanco] = useState(0);
  const [statsLocais, setStatsLocais] = useState({ duplicados: 0, erros: 0 });
  
  // Histórico Visual
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  // Carrega dados iniciais ao abrir a página
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      // 1. Busca o totalizador
      const resResumo = await axios.get('http://localhost:8080/api/dashboard/resumo');
      setTotalPresencasBanco(resResumo.data.presentesPortaria);

      // 2. Busca o histórico persistente do banco
      const resHistorico = await axios.get('http://localhost:8080/api/chamada/historico-portaria');
      
      // Converte os dados do Java para o formato visual da tabela
      const historicoFormatado: HistoricoItem[] = resHistorico.data.map((item: any) => ({
        hora: item.hora,
        nome: item.alunoNome,
        status: 'SUCESSO', // Registros do banco são sempre sucessos
        mensagem: 'Registro salvo'
      }));
      
      setHistorico(historicoFormatado);

    } catch (error) {
      console.error("Erro ao carregar dados da portaria", error);
    }
  };

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termo.trim()) return;

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/chamada/registrar-portaria', { 
        termo: termo 
      });

      const dados = response.data;
      
      if (dados.status === 'SUCESSO') {
        // Se deu certo, atualizamos o contador buscando do banco novamente
        const resResumo = await axios.get('http://localhost:8080/api/dashboard/resumo');
        setTotalPresencasBanco(resResumo.data.presentesPortaria);
      } else if (dados.status === 'DUPLICADO') {
        setStatsLocais(s => ({ ...s, duplicados: s.duplicados + 1 }));
      } else {
        setStatsLocais(s => ({ ...s, erros: s.erros + 1 }));
      }

      // Adiciona o novo item no topo da lista visualmente
      const novoItem: HistoricoItem = {
        hora: dados.hora || new Date().toLocaleTimeString(),
        nome: dados.alunoNome || termo,
        status: dados.status,
        mensagem: dados.mensagem
      };

      setHistorico(prev => [novoItem, ...prev]);
      setTermo('');

    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-center p-4">
          <div className="bg-primary text-white p-3 rounded-3 me-3">
            <Shield size={32} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Módulo da Porta</h4>
            <span className="text-muted">Controle de entrada dos alunos na escola</span>
          </div>
        </div>
      </div>

      {/* CARDS DE STATUS */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 border-success border-2 bg-light shadow-sm text-center py-2">
             <div className="card-body">
                <CheckCircle className="text-success mb-2" size={32}/>
                <h3 className="fw-bold text-success mb-0">{totalPresencasBanco}</h3>
                <small className="text-muted fw-bold">Presenças hoje (Total)</small>
             </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 border-warning border-2 bg-light shadow-sm text-center py-2">
             <div className="card-body">
                <AlertTriangle className="text-warning mb-2" size={32}/>
                <h3 className="fw-bold text-warning mb-0">{statsLocais.duplicados}</h3>
                <small className="text-muted fw-bold">Tentativas Duplicadas</small>
             </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-danger border-2 bg-light shadow-sm text-center py-2">
             <div className="card-body">
                <XCircle className="text-danger mb-2" size={32}/>
                <h3 className="fw-bold text-danger mb-0">{statsLocais.erros}</h3>
                <small className="text-muted fw-bold">Erros / Não encontrados</small>
             </div>
          </div>
        </div>
      </div>

      {/* INPUT */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
           <h5 className="fw-bold text-secondary mb-0">Verificar Aluno</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleVerificar}>
            <label className="fw-bold text-dark mb-2">ID ou Nome do Aluno</label>
            <div className="d-flex gap-2 mb-4">
              <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="Digite o ID ou nome..." 
                value={termo}
                onChange={e => setTermo(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-secondary btn-lg px-4 fw-bold" disabled={loading}>
                <Search size={20} className="me-2"/> Verificar
              </button>
            </div>
          </form>
          <div className="alert alert-primary border-primary bg-light-blue d-flex" role="alert">
            <div className="me-3"><Shield size={20}/></div>
            <div><small>Digite o ID completo (ex: 001) ou Nome e tecle Enter.</small></div>
          </div>
        </div>
      </div>

      {/* HISTÓRICO PERSISTENTE */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold text-secondary mb-0">Histórico de Hoje</h5>
        </div>
        <div className="card-body p-0">
            {historico.length === 0 ? (
                <div className="text-center py-4 text-muted">Nenhum registro ainda hoje.</div>
            ) : (
                <table className="table table-striped mb-0 align-middle">
                  <tbody>
                    {historico.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-4"><Clock size={14} className="me-1"/> {item.hora}</td>
                        <td className="fw-bold">{item.nome}</td>
                        <td className="text-end pe-4">
                           {item.status === 'SUCESSO' && <span className="badge bg-success">OK</span>}
                           {item.status === 'DUPLICADO' && <span className="badge bg-warning text-dark">DUPLICADO</span>}
                           {item.status === 'ERRO' && <span className="badge bg-danger">ERRO</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
        </div>
      </div>

    </div>
  );
}