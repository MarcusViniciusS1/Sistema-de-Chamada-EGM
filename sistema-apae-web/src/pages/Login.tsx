import React, { useState } from 'react';
import { User, Lock, Bus, AlertCircle } from 'lucide-react'; // Adicionei AlertCircle para erro
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importando o conector de API

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para guardar mensagem de erro
  const [loading, setLoading] = useState(false); // Estado para mostrar "Carregando..."
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);

    try {

      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: username,
        senha: password
      });

      // 2. Verifica a resposta do Java
      if (response.data.sucesso) {
        console.log("Login realizado:", response.data);
        
   
        localStorage.setItem('usuarioLogado', JSON.stringify(response.data));

 
        navigate('/dashboard');
      } else {
        setError('Usuário ou senha incorretos.');
      }

    } catch (err) {
      console.error(err);
      setError('❌ Login ou senha incorretos! Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
      
      <div className="card shadow border-0" style={{ maxWidth: '400px', width: '100%' }}>
        
        <div className="card-header bg-primary py-2"></div>
        
        <div className="card-body p-4">
          
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
              <Bus size={30} />
            </div>
            <h3 className="fw-bold text-dark">Sistema APAE</h3>
            <p className="text-muted small">Lista de Chamada Digital</p>
          </div>

          {/* Exibe Erro se houver */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center p-2 mb-3 small" role="alert">
              <AlertCircle size={16} className="me-2" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary">Usuário</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <User size={18} className="text-secondary" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Ex: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ boxShadow: 'none' }} 
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-secondary" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ boxShadow: 'none' }}
                  required
                />
              </div>
            </div>

            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary py-2 fw-bold"
                disabled={loading} 
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}