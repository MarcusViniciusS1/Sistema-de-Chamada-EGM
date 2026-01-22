import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Bus } from 'lucide-react';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="d-flex vh-100 bg-dark" style={{ overflow: 'hidden' }}>
      
      {/* --- SIDEBAR DESKTOP (Fixo na esquerda, empurra o conteúdo) --- */}
      <div className="d-none d-md-block h-100" style={{ width: '280px', flexShrink: 0 }}>
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* --- SIDEBAR MOBILE (Flutuante / Gaveta) --- */}
      {mobileMenuOpen && (
        <>
            {/* Fundo escuro ao clicar fecha */}
            <div 
                className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50" 
                style={{ zIndex: 1040 }}
                onClick={() => setMobileMenuOpen(false)}
            />
            {/* O Menu em si */}
            <div className="d-md-none position-fixed top-0 start-0 h-100 shadow-lg" style={{ zIndex: 1050, width: '280px' }}>
                <Sidebar isOpen={true} onClose={() => setMobileMenuOpen(false)} />
            </div>
        </>
      )}

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-grow-1 d-flex flex-column h-100 w-100" style={{ overflow: 'hidden' }}>
        
        {/* Header Mobile (Só aparece em telas pequenas) */}
        <div className="d-md-none bg-primary text-white p-3 d-flex align-items-center shadow-sm flex-shrink-0">
            <button className="btn btn-link text-white p-0 me-3" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={32}/>
            </button>
            <div className="d-flex align-items-center">
                <Bus className="me-2" size={24}/>
                <h5 className="mb-0 fw-bold">Sistema APAE</h5>
            </div>
        </div>

        {/* Área de Scroll da Página */}
        <main className="flex-grow-1 overflow-auto bg-dark position-relative">
            <div className="container-fluid p-4">
                <Outlet />
            </div>
        </main>
      </div>

    </div>
  );
}