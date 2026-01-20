import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CadastroAluno } from './pages/CadastroAluno';
import { CadastroOnibus } from './pages/CadastroOnibus';
import { Portaria } from './pages/Portaria';
 

// Componentes "Placeholder" simples para as rotas que ainda não criamos
const Refeitorio = () => <h2 className="text-center mt-5">Sistema do Refeitório (Em construção)</h2>;

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

      </Route>
    </Routes>
  );
}

export default App;