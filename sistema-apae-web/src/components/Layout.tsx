import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Utensils, 
  DoorOpen, 
  LogOut, 
  Users, 
  Bus, 
  UserCog, 
  Settings, 
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const isAdmin = usuarioLogado.perfil === 'ADMIN';

  // Estado para controlar o menu da engrenagem
  const [menuConfigAberto, setMenuConfigAberto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    navigate('/');
  };

  const handleResetarDia = async () => {
    if (window.confirm("⚠️ ATENÇÃO: Isso apagará TODAS as chamadas e status de rotas de HOJE.\n\nUse apenas para corrigir bugs.\n\nDeseja continuar?")) {
        try {
            await axios.delete('http://localhost:8080/api/sistema/resetar-dia');
            alert("Sistema resetado com sucesso! A página será recarregada.");
            window.location.reload();
        } catch (error) {
            alert("Erro ao resetar sistema.");
        }
    }
    setMenuConfigAberto(false);
  };

  // Ítem de Menu Componentizado para evitar repetição
  const MenuItem = ({ to, icon, label }: { to: string, icon: any, label: string }) => (
    <li className="nav-item mb-1">
      <Link
        to={to}
        className={`nav-link d-flex align-items-center px-3 py-2 rounded-3 ${
          location.pathname === to 
            ? 'bg-primary text-white shadow fw-bold' 
            : 'text-white-50 hover-bg-dark text-decoration-none'
        }`}
        style={{ transition: 'all 0.2s ease-in-out' }}
      >
        <span className="me-3 d-flex align-items-center">{icon}</span>
        <span style={{ fontSize: '0.95rem' }}>{label}</span>
        {location.pathname === to && <ChevronRight size={16} className="ms-auto opacity-75"/>}
      </Link>
    </li>
  );

  return (
    <div className="d-flex vh-100" style={{ backgroundColor: '#0f172a' }}>
      
      {/* SIDEBAR */}
      <aside className="d-flex flex-column p-3 text-white border-end border-secondary border-opacity-25" 
             style={{ width: '280px', backgroundColor: '#1e293b' }}>
        
        {/* CABEÇALHO */}
        <div className="d-flex align-items-center mb-5 px-2 mt-2">
            <div className="bg-primary bg-gradient rounded-3 p-2 me-3 text-white shadow-sm">
                <Bus size={28}/>
            </div>
            <div className="lh-1">
                <h5 className="mb-0 fw-bold tracking-tight">Sistema APAE</h5>
                <small className="text-white-50" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Transporte Escolar</small>
            </div>
        </div>

        {/* NAVEGAÇÃO COM SCROLL */}
        <div className="flex-grow-1 overflow-auto custom-scrollbar">
            
            {/* GRUPO OPERACIONAL */}
            <div className="mb-4">
                <small className="text-uppercase text-white-50 fw-bold px-3 mb-2 d-block" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>
                    Operacional
                </small>
                <ul className="nav nav-pills flex-column">
                    <MenuItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                    <MenuItem to="/monitora" icon={<Map size={20}/>} label="Monitoramento" />
                    <MenuItem to="/refeitorio" icon={<Utensils size={20}/>} label="Refeitório" />
                    <MenuItem to="/portaria" icon={<DoorOpen size={20}/>} label="Portaria" />
                </ul>
            </div>

            {/* GRUPO ADMINISTRAÇÃO (SÓ ADMIN) */}
            {isAdmin && (
                <div className="mb-4">
                    <small className="text-uppercase text-white-50 fw-bold px-3 mb-2 d-block" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>
                        Administração
                    </small>
                    <ul className="nav nav-pills flex-column">
                        <MenuItem to="/alunos" icon={<Users size={20}/>} label="Alunos" />
                        <MenuItem to="/frota" icon={<Bus size={20}/>} label="Frota" />
                        <MenuItem to="/usuarios" icon={<UserCog size={20}/>} label="Usuários" />
                    </ul>
                </div>
            )}

        </div>

        {/* RODAPÉ (USUÁRIO + CONFIG + SAIR) */}
        <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between px-2">
            
            {/* Info Usuário */}
            <div className="d-flex align-items-center overflow-hidden">
                <div className="bg-secondary bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0 text-white" 
                     style={{width: 40, height: 40}}>
                    <span className="fw-bold fs-6">{usuarioLogado.nome?.charAt(0)}</span>
                </div>
                <div className="text-truncate">
                    <div className="fw-bold small text-white">{usuarioLogado.nome}</div>
                    <div className="text-white-50" style={{fontSize: '0.7rem'}}>{usuarioLogado.perfil}</div>
                </div>
            </div>

            {/* Ações */}
            <div className="d-flex align-items-center position-relative">
                
                {/* ENGRENAGEM (ADMIN) */}
                {isAdmin && (
                    <div className="position-relative">
                        <button 
                            className={`btn btn-link p-2 me-1 rounded-circle transition-all ${menuConfigAberto ? 'text-primary bg-dark' : 'text-white-50 hover-text-white'}`}
                            onClick={() => setMenuConfigAberto(!menuConfigAberto)}
                            title="Ferramentas do Sistema"
                        >
                            <Settings size={20}/>
                        </button>

                        {/* MENU FLUTUANTE */}
                        {menuConfigAberto && (
                            <div className="position-absolute bottom-100 end-0 mb-3 bg-dark border border-secondary border-opacity-50 rounded-3 shadow-lg p-2 animate-fade-in" 
                                 style={{width: '200px', zIndex: 9999}}>
                                <div className="px-2 py-1 mb-2 border-bottom border-secondary border-opacity-25">
                                    <small className="fw-bold text-white text-uppercase" style={{fontSize:'0.65rem'}}>Ações Rápidas</small>
                                </div>
                                <button 
                                    className="btn btn-sm btn-danger w-100 d-flex align-items-center justify-content-start px-3 py-2 fw-bold"
                                    onClick={handleResetarDia}
                                >
                                    <RefreshCw size={14} className="me-2"/> Reiniciar Dia
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* BOTÃO SAIR */}
                <button 
                    onClick={handleLogout} 
                    className="btn btn-link p-2 text-white-50 hover-text-danger rounded-circle transition-all" 
                    title="Sair"
                >
                    <LogOut size={20}/>
                </button>
            </div>

          </div>
        </div>

      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-grow-1 overflow-auto bg-dark">
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}