import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bus, Shield, Utensils, LogOut, UserCog, Smartphone, GraduationCap } from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const perfil = usuarioLogado.perfil;

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    navigate('/');
  };

  // Estilo do link ativo: Um fundo azul suave com borda esquerda brilhante
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `nav-link d-flex align-items-center px-3 py-2 rounded-2 mb-1 transition-all ${
      isActive 
        ? 'bg-primary text-white shadow-sm fw-bold' 
        : 'text-gray-400 hover-bg-slate'
    }`;
  };

  // Estilo inline para customizar hover que o Bootstrap não tem nativo fácil
  const linkStyle = { color: '#cbd5e1', textDecoration: 'none' };

  return (
    <div className="d-flex vh-100" style={{backgroundColor: '#0f172a'}}> {/* Fundo Body Global */}
      
      {/* SIDEBAR - Cor escura personalizada (#1e293b é o Slate-800) */}
      <div className="d-flex flex-column flex-shrink-0 p-3" 
           style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155' }}>
        
        <a href="/" className="d-flex align-items-center mb-4 text-white text-decoration-none px-2">
          <div className="bg-primary p-2 rounded-3 me-3 shadow">
            <Bus size={24} className="text-white" />
          </div>
          <span className="fs-5 fw-bold tracking-tight">Sistema APAE</span>
        </a>
        
        <hr className="border-secondary opacity-25 mb-4 mt-0" />
        
        <ul className="nav nav-pills flex-column mb-auto">
          
          {perfil === 'ADMIN' && (
            <>
              <small className="text-uppercase fw-bold text-muted ms-2 mb-2" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Administração</small>
              <li className="nav-item">
                <Link to="/dashboard" className={getLinkClass('/dashboard')} style={location.pathname !== '/dashboard' ? linkStyle : {}}>
                  <LayoutDashboard size={18} className="me-3"/> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/usuarios" className={getLinkClass('/usuarios')} style={location.pathname !== '/usuarios' ? linkStyle : {}}>
                  <UserCog size={18} className="me-3"/> Usuários
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/alunos" className={getLinkClass('/alunos')} style={location.pathname !== '/alunos' ? linkStyle : {}}>
                  <GraduationCap size={18} className="me-3"/> Alunos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/onibus" className={getLinkClass('/onibus')} style={location.pathname !== '/onibus' ? linkStyle : {}}>
                  <Bus size={18} className="me-3"/> Frota
                </Link>
              </li>
              <div className="my-3"></div>
            </>
          )}

          <small className="text-uppercase fw-bold text-muted ms-2 mb-2" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Operacional</small>
          
          {(perfil === 'ADMIN' || perfil === 'PORTEIRO') && (
            <li className="nav-item">
              <Link to="/portaria" className={getLinkClass('/portaria')} style={location.pathname !== '/portaria' ? linkStyle : {}}>
                <Shield size={18} className="me-3"/> Portaria
              </Link>
            </li>
          )}

          {(perfil === 'ADMIN' || perfil === 'REFEITORIO') && (
            <li className="nav-item">
              <Link to="/refeitorio" className={getLinkClass('/refeitorio')} style={location.pathname !== '/refeitorio' ? linkStyle : {}}>
                <Utensils size={18} className="me-3"/> Refeitório
              </Link>
            </li>
          )}

          {(perfil === 'ADMIN' || perfil === 'MONITOR') && (
            <li className="nav-item">
              <Link to="/monitora" className={getLinkClass('/monitora')} style={location.pathname !== '/monitora' ? linkStyle : {}}>
                <Smartphone size={18} className="me-3"/> App Monitora
              </Link>
            </li>
          )}

        </ul>
        
        <div className="mt-auto pt-4 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center p-2 rounded-3" style={{backgroundColor: '#0f172a'}}>
            <div className="me-2 bg-gradient bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{width: 36, height: 36, fontWeight: 'bold'}}>
                {usuarioLogado.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden me-auto">
                <strong className="d-block text-truncate text-white" style={{fontSize: '0.9rem', maxWidth: '100px'}}>
                  {usuarioLogado.nome?.split(' ')[0]}
                </strong>
                <small className="text-muted" style={{fontSize: '0.7rem'}}>{perfil}</small>
            </div>
            <button onClick={handleLogout} className="btn btn-icon btn-sm text-danger hover-danger" title="Sair">
                <LogOut size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-grow-1 overflow-auto" style={{backgroundColor: '#0f172a'}}> {/* Garante fundo escuro */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}