import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Utensils, Users, Filter } from 'lucide-react';

interface AlunoRefeicao {
  nome: string;
  matricula: string;
  tipoAlimentar: string;
  status: string;
  alergias?: string;
}

export function Refeitorio() {
  const [alunos, setAlunos] = useState<AlunoRefeicao[]>([]);
  const [filtro, setFiltro] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 5000); // Atualiza a cada 5s
    return () => clearInterval(intervalo);
  }, []);

  const carregarDados = async () => {
    try {
      // Busca apenas a lista de presentes (foco total na cozinha)
      const resRefeitorio = await axios.get('http://localhost:8080/api/refeitorio/presenca-hoje');
      setAlunos(resRefeitorio.data);
    } catch (err) {
      console.error("Erro ao carregar dados do refeitório", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS DOS PRESENTES ---
  const stats = useMemo(() => {
    return {
      presentes: alunos.length, // Quantos vieram hoje
      semRestricao: alunos.filter(a => a.tipoAlimentar === 'Sem restrição').length,
      vegetariano: alunos.filter(a => a.tipoAlimentar === 'Vegetariano').length,
      diabetico: alunos.filter(a => a.tipoAlimentar === 'Diabético').length,
      pastoso: alunos.filter(a => a.tipoAlimentar === 'Pastoso').length,
      comRestricao: alunos.filter(a => a.tipoAlimentar === 'Com Restrição').length,
    };
  }, [alunos]);

  const alunosFiltrados = alunos.filter(aluno => {
    if (filtro === 'Todos') return true;
    return aluno.tipoAlimentar === filtro;
  });

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-center p-4">
          <div className="bg-orange text-white p-3 rounded-3 me-3" style={{ backgroundColor: '#fd7e14' }}>
            <Utensils size={32} color="white" />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Módulo Refeitório</h4>
            <span className="text-muted">Controle alimentar dos alunos presentes hoje</span>
          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="row g-3 mb-4">
        
        {/* Total Presentes (Destaque Maior) */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center py-4 h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-center mb-3">
               <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                 <Users className="text-primary" size={32}/>
               </div>
            </div>
            <h2 className="fw-bold text-primary mb-0 display-4">{stats.presentes}</h2>
            <small className="text-muted fw-bold text-uppercase ls-1">Alunos Presentes Agora</small>
          </div>
        </div>

        {/* Estatísticas de Comida (Grid detalhado) */}
        <div className="col-md-8">
            <div className="card border-0 shadow-sm h-100 p-3">
                <h6 className="fw-bold text-secondary mb-3 ps-2 border-start border-4 border-warning">Resumo da Dieta</h6>
                <div className="row g-2 h-100 align-items-center">
                    
                    <div className="col-4">
                      <div className="bg-light rounded p-2 text-center border">
                        <h4 className="fw-bold text-success mb-0">{stats.semRestricao}</h4>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Sem Restrição</small>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="bg-light rounded p-2 text-center border">
                        <h4 className="fw-bold text-success mb-0">{stats.vegetariano}</h4>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Vegetariano</small>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="bg-light rounded p-2 text-center border">
                        <h4 className="fw-bold text-danger mb-0">{stats.diabetico}</h4>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Diabético</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="bg-light rounded p-2 text-center border">
                        <h4 className="fw-bold mb-0" style={{color: '#6f42c1'}}>{stats.pastoso}</h4>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Pastoso</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="bg-light rounded p-2 text-center border">
                        <h4 className="fw-bold text-warning mb-0">{stats.comRestricao}</h4>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Outras Restrições</small>
                      </div>
                    </div>

                </div>
            </div>
        </div>
      </div>

      {/* ÁREA DE FILTROS */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center">
            <Filter size={18} className="me-2"/> Filtrar Lista
          </h6>
          <div className="d-flex gap-2 flex-wrap">
            <button onClick={() => setFiltro('Todos')} className={`btn btn-sm fw-bold ${filtro === 'Todos' ? 'btn-primary' : 'btn-light border'}`}>
              Todos Presentes ({stats.presentes})
            </button>
            <button onClick={() => setFiltro('Sem restrição')} className={`btn btn-sm fw-bold ${filtro === 'Sem restrição' ? 'btn-success text-white' : 'btn-light border'}`}>
              Sem restrição ({stats.semRestricao})
            </button>
            <button onClick={() => setFiltro('Vegetariano')} className={`btn btn-sm fw-bold ${filtro === 'Vegetariano' ? 'btn-success text-white' : 'btn-light border'}`}>
              Vegetariano ({stats.vegetariano})
            </button>
            <button onClick={() => setFiltro('Diabético')} className={`btn btn-sm fw-bold ${filtro === 'Diabético' ? 'btn-danger text-white' : 'btn-light border'}`}>
              Diabético ({stats.diabetico})
            </button>
            <button onClick={() => setFiltro('Pastoso')} className={`btn btn-sm fw-bold ${filtro === 'Pastoso' ? 'text-white' : 'btn-light border'}`} style={{ backgroundColor: filtro === 'Pastoso' ? '#6f42c1' : '' }}>
              Pastoso ({stats.pastoso})
            </button>
            <button onClick={() => setFiltro('Com Restrição')} className={`btn btn-sm fw-bold ${filtro === 'Com Restrição' ? 'btn-warning text-dark' : 'btn-light border'}`}>   
            Com Restrição ({stats.comRestricao})
            </button> 
          </div>
        </div>
      </div>

      {/* LISTA DE ALUNOS */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
           <h6 className="fw-bold text-secondary mb-0">Lista Nominal ({alunosFiltrados.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Nome do Aluno</th>
                  <th>Matrícula</th>
                  <th>Localização</th>
                  <th>Dieta</th>
                  <th>Alergias</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno, i) => (
                  <tr key={i}>
                    <td className="ps-4 fw-bold text-dark">{aluno.nome}</td>
                    <td><span className="badge bg-light text-dark border">{aluno.matricula}</span></td>
                    <td>
                      {aluno.status === 'NA ESCOLA' 
                        ? <span className="badge bg-primary">Na Escola</span> 
                        : <span className="badge bg-success">No Ônibus</span>
                      }
                    </td>
                    <td>
                      {/* CORREÇÃO AQUI: Terminologia adequada */}
                      {aluno.tipoAlimentar === 'Sem restrição' && <span className="badge bg-success bg-opacity-10 text-success">Sem restrição</span>}
                      {aluno.tipoAlimentar === 'Diabético' && <span className="badge bg-danger bg-opacity-10 text-danger">Diabético</span>}
                      {aluno.tipoAlimentar === 'Vegetariano' && <span className="badge bg-success">Vegetariano</span>}
                      {aluno.tipoAlimentar === 'Pastoso' && <span className="badge text-white" style={{backgroundColor: '#6f42c1'}}>Pastoso</span>}
                      {aluno.tipoAlimentar === 'Com Restrição' && <span className="badge bg-warning text-dark">Restrição</span>}
                    </td>
                    <td>
                      {aluno.alergias ? <span className="text-danger fw-bold small">{aluno.alergias}</span> : <span className="text-muted small">-</span>}
                    </td>
                  </tr>
                ))}
                
                {!loading && alunosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Nenhum aluno presente correspondente ao filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}