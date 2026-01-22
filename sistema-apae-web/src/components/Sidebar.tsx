import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Utensils, DoorOpen, LogOut, Users, Bus, UserCog, 
  Settings, RefreshCw, ChevronRight, FileText, X 
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SidebarProps {
  isOpen: boolean; // Usado apenas para controle mobile se necessário
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';
  const [menuConfigAberto, setMenuConfigAberto] = useState(false);

  const handleLogout = () => { localStorage.removeItem('usuarioLogado'); navigate('/'); };

  const handleResetarDia = async () => {
    if (window.confirm("⚠️ ATENÇÃO: Resetar dia?")) {
        try { await axios.delete('http://localhost:8080/api/sistema/resetar-dia'); window.location.reload(); } 
        catch (e) { alert("Erro."); }
    }
    setMenuConfigAberto(false);
  };

  const gerarRelatorioBombeiros = async () => {
    try {
        const res = await axios.get('http://localhost:8080/api/chamadas/relatorio-evacuacao');
        const lista = res.data;
        const doc = new jsPDF();
        doc.setFillColor(220, 53, 69); doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255); doc.setFontSize(22); doc.text("RELATÓRIO DE EVACUAÇÃO", 105, 15, { align: 'center' });
        doc.setTextColor(0);
        autoTable(doc, { startY: 45, head: [['Nome', 'Idade', 'Obs', 'Chegada']], body: lista.map((a:any)=>[a.nomeAluno, a.idade, a.deficiencia, a.horaChegada]) });
        doc.save('Relatorio_Bombeiros.pdf');
        setMenuConfigAberto(false);
    } catch (e) { alert("Erro."); }
  };

  const MenuItem = ({ to, icon, label }: any) => (
    <li className="nav-item mb-1">
      <Link to={to} onClick={onClose} className={`nav-link d-flex align-items-center px-3 py-2 rounded-3 ${location.pathname === to ? 'bg-primary text-white shadow fw-bold' : 'text-white-50 hover-bg-dark'}`}>
        <span className="me-3">{icon}</span><span>{label}</span>{location.pathname === to && <ChevronRight size={16} className="ms-auto opacity-75"/>}
      </Link>
    </li>
  );

  return (
    <aside className="d-flex flex-column p-3 text-white border-end border-secondary border-opacity-25 bg-dark h-100" style={{ width: '280px' }}>
        
        {/* CABEÇALHO */}
        <div className="d-flex align-items-center justify-content-between mb-5 px-2 mt-2">
            <div className="d-flex align-items-center">
                <div className="bg-primary rounded-3 p-2 me-3 text-white shadow-sm"><Bus size={28}/></div>
                <div className="lh-1">
                    <h5 className="mb-0 fw-bold">Sistema APAE</h5>
                    <small className="text-white-50" style={{fontSize: '0.75rem'}}>Transporte</small>
                </div>
            </div>
            {/* Botão Fechar só aparece se o container pai permitir (mobile) */}
            <button className="btn btn-link text-white d-md-none ms-auto" onClick={onClose}><X size={24}/></button>
        </div>

        {/* MENU SCROLLAVEL */}
        <div className="flex-grow-1 overflow-auto custom-scrollbar">
            <div className="mb-4">
                <small className="text-uppercase text-white-50 fw-bold px-3 mb-2 d-block" style={{fontSize: '0.7rem'}}>Operacional</small>
                <ul className="nav nav-pills flex-column">
                    <MenuItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                    <MenuItem to="/monitora" icon={<Map size={20}/>} label="Monitoramento" />
                    <MenuItem to="/refeitorio" icon={<Utensils size={20}/>} label="Refeitório" />
                    <MenuItem to="/portaria" icon={<DoorOpen size={20}/>} label="Portaria" />
                </ul>
            </div>
            {isAdmin && (
                <div className="mb-4">
                    <small className="text-uppercase text-white-50 fw-bold px-3 mb-2 d-block" style={{fontSize: '0.7rem'}}>Administração</small>
                    <ul className="nav nav-pills flex-column">
                        <MenuItem to="/alunos" icon={<Users size={20}/>} label="Alunos" />
                        <MenuItem to="/frota" icon={<Bus size={20}/>} label="Frota" />
                        <MenuItem to="/usuarios" icon={<UserCog size={20}/>} label="Usuários" />
                    </ul>
                </div>
            )}
        </div>

        {/* RODAPÉ */}
        <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between px-2">
            <div className="d-flex align-items-center overflow-hidden">
                <div className="bg-secondary bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0" style={{width: 40, height: 40}}>
                    <span className="fw-bold">{usuarioLogado.nome?.charAt(0)}</span>
                </div>
                <div className="text-truncate">
                    <div className="fw-bold small text-white">{usuarioLogado.nome}</div>
                    <div className="text-white-50" style={{fontSize: '0.7rem'}}>{usuarioLogado.perfil}</div>
                </div>
            </div>

            <div className="d-flex align-items-center position-relative">
                {isAdmin && (
                    <div className="position-relative">
                        <button className={`btn btn-link p-2 me-1 rounded-circle ${menuConfigAberto ? 'text-primary' : 'text-white-50'}`} onClick={() => setMenuConfigAberto(!menuConfigAberto)}>
                            <Settings size={20}/>
                        </button>
                        {menuConfigAberto && (
                            <div className="position-absolute bottom-100 end-0 mb-3 bg-dark border border-secondary border-opacity-50 rounded-3 shadow-lg p-2" style={{width: '200px', zIndex: 9999}}>
                                <button className="btn btn-sm btn-outline-light w-100 mb-2 border-0 text-start" onClick={gerarRelatorioBombeiros}>
                                    <FileText size={14} className="me-2 text-warning"/> Relatório
                                </button>
                                <button className="btn btn-sm btn-danger w-100 fw-bold text-start" onClick={handleResetarDia}>
                                    <RefreshCw size={14} className="me-2"/> Resetar
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <button onClick={handleLogout} className="btn btn-link p-2 text-white-50 hover-text-danger"><LogOut size={20}/></button>
            </div>
          </div>
        </div>
    </aside>
  );
}