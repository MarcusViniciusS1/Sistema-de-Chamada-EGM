import { Link, Outlet } from 'react-router-dom';
import { Bus, Users, Home, DoorOpen, Utensils, LogOut } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Barra de Navegação Azul (Header) */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/dashboard">
          <Bus className="me-2" /> Sistema APAE
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link text-white" to="/dashboard"><Home size={18} className="me-1"/> Dashboard</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/alunos"><Users size={18} className="me-1"/> Alunos</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/onibus"><Bus size={18} className="me-1"/> Ônibus</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/portaria"><DoorOpen size={18} className="me-1"/> Portaria</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/refeitorio"><Utensils size={18} className="me-1"/> Refeitório</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/CadastroMonitora"><Users size={18} className="me-1"/> Cadastro</Link></li>

            {/* Botão Sair */}
            <li className="nav-item ms-3">
              <Link className="btn btn-outline-light btn-sm d-flex align-items-center" to="/">
                <LogOut size={16} className="me-1" /> Sair
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Área de Conteúdo (Onde as páginas vão mudar) */}
      <div className="container-fluid p-4">
        <Outlet /> 
      </div>
    </div>
  );
}