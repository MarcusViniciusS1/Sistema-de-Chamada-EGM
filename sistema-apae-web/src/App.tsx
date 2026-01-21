import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/Layout';
import { Portaria } from './pages/Portaria';
import { Refeitorio } from './pages/Refeitorio';
import { Monitora } from './pages/Monitora';
import { GestaoUsuarios } from './pages/GestaoUsuarios';
import { GestaoAlunos } from './pages/GestaoAlunos';
import { CadastroOnibus } from './pages/CadastroOnibus';
import { RotaProtegida } from './components/RotaProtegida';

function App() {
  return (
    // Note: Removemos o <BrowserRouter> daqui se ele já estiver no main.tsx
    // Mas como o erro anterior pediu para remover do main.tsx, mantenha AQUI.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          
          <Route path="/dashboard" element={
            <RotaProtegida perfisPermitidos={['ADMIN']}> <Dashboard /> </RotaProtegida>
          } />

          <Route path="/portaria" element={
            <RotaProtegida perfisPermitidos={['ADMIN', 'PORTEIRO']}> <Portaria /> </RotaProtegida>
          } />

          <Route path="/refeitorio" element={
            <RotaProtegida perfisPermitidos={['ADMIN', 'REFEITORIO']}> <Refeitorio /> </RotaProtegida>
          } />

          <Route path="/monitora" element={
            <RotaProtegida perfisPermitidos={['ADMIN', 'MONITOR']}> <Monitora /> </RotaProtegida>
          } />

          {/* Rota corrigida: /usuarios */}
          <Route path="/usuarios" element={
            <RotaProtegida perfisPermitidos={['ADMIN']}> <GestaoUsuarios /> </RotaProtegida>
          } />

          {/* NOVA ROTA ADICIONADA: /alunos */}
          <Route path="/alunos" element={
            <RotaProtegida perfisPermitidos={['ADMIN']}> <GestaoAlunos /> </RotaProtegida>
          } />

           <Route path="/onibus" element={
            <RotaProtegida perfisPermitidos={['ADMIN']}> <CadastroOnibus /> </RotaProtegida>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;