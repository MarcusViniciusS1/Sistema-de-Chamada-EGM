import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CadastroAluno } from './pages/CadastroAluno';
import { CadastroOnibus } from './pages/CadastroOnibus';
import { Portaria } from './pages/Portaria';
import { CadastroMonitora } from './pages/CadastroMonitora'; 
import { Refeitorio } from './pages/Refeitorio';
import { Monitora } from './pages/Monitora';

function App() {
  return (
    <Routes>
      {/* Rota Pública (Login fica fora do layout padrão) */}
      <Route path="/" element={<Login />} />

      {/* Rotas Protegidas (Ficam DENTRO do Layout com menu azul) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alunos" element={<CadastroAluno />} />
        <Route path="/onibus" element={<CadastroOnibus />} />
        <Route path="/portaria" element={<Portaria />} />
        <Route path="/refeitorio" element={<Refeitorio />} />
        <Route path="/CadastroMonitora" element={<CadastroMonitora />} />
        <Route path="/monitora" element={<Monitora />} />

      </Route>
    </Routes>
  );
}

export default App;