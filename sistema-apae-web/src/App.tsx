import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Monitora } from './pages/Monitora';
import { Refeitorio } from './pages/Refeitorio';
import { Portaria } from './pages/Portaria';

// Páginas Administrativas
import { GestaoAlunos } from './pages/GestaoAlunos';
import { CadastroOnibus } from './pages/CadastroOnibus'; // Essa é a /frota
import { GestaoUsuarios } from './pages/GestaoUsuarios';

// Componente para proteger rotas (Só logado acessa)
function RotaProtegida({ children }: { children: JSX.Element }) {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  return usuarioLogado ? children : <Navigate to="/" />;
}

// Componente para proteger rotas de Admin (Só Admin acessa)
function RotaAdmin({ children }: { children: JSX.Element }) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  return usuarioLogado.perfil === 'ADMIN' ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login (Pública) */}
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          
          {/* Rotas Operacionais (Todos acessam) */}
          <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
          <Route path="/monitora" element={<RotaProtegida><Monitora /></RotaProtegida>} />
          <Route path="/refeitorio" element={<RotaProtegida><Refeitorio /></RotaProtegida>} />
          <Route path="/portaria" element={<RotaProtegida><Portaria /></RotaProtegida>} />

          {/* Rotas Administrativas (Só Admin acessa) */}
          <Route path="/alunos" element={
            <RotaProtegida><RotaAdmin><GestaoAlunos /></RotaAdmin></RotaProtegida>
          } />
          
          {/* AQUI ESTÁ A CORREÇÃO DA FROTA */}
          <Route path="/frota" element={
            <RotaProtegida><RotaAdmin><CadastroOnibus /></RotaAdmin></RotaProtegida>
          } />
          
          <Route path="/usuarios" element={
            <RotaProtegida><RotaAdmin><GestaoUsuarios /></RotaAdmin></RotaProtegida>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}