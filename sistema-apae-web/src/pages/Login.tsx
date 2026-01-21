import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bus, User, Lock, AlertCircle } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Tenta fazer login na API
      // OBS: Certifique-se de que seu backend tem esse endpoint /api/auth/login funcionando
      // Se você não tiver um AuthController, pode ser necessário criar um ou usar o UsuarioController para validar
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        senha
      });

      if (response.status === 200) {
        const usuario = response.data;
        
        // 1. Salva o usuário no navegador para manter a sessão
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        // 2. REDIRECIONAMENTO INTELIGENTE (Smart Redirect)
        // Manda cada funcionário direto para sua área
        switch(usuario.perfil) {
            case 'ADMIN':
                navigate('/dashboard');
                break;
            case 'PORTEIRO':
                navigate('/portaria');
                break;
            case 'REFEITORIO':
                navigate('/refeitorio');
                break;
            case 'MONITOR':
                navigate('/monitora');
                break;
            default:
                // Se o perfil for desconhecido, manda pro dashboard ou avisa
                navigate('/dashboard'); 
        }
      }
    } catch (err) {
      console.error(err);
      setError('Login ou senha incorretos! Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card border-0 shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body text-center">
          
          {/* Logo / Ícone */}
          <div className="mb-4 d-inline-block bg-primary p-3 rounded-circle text-white">
            <Bus size={40} />
          </div>
          
          <h3 className="fw-bold text-dark mb-1">Sistema APAE</h3>
          <p className="text-muted mb-4">Lista de Chamada Digital</p>

          {/* Alerta de Erro */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center p-2 mb-3 small" role="alert">
              <AlertCircle size={16} className="me-2" />
              <div>{error}</div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLogin}>
            
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <label htmlFor="floatingInput" className="d-flex align-items-center text-muted">
                <User size={16} className="me-2" /> Usuário
              </label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <label htmlFor="floatingPassword" className="d-flex align-items-center text-muted">
                <Lock size={16} className="me-2" /> Senha
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm" 
              disabled={loading}
            >
              {loading ? (
                <span>Carregando...</span>
              ) : (
                'Entrar'
              )}
            </button>

          </form>
        </div>
        <div className="card-footer bg-white border-0 text-center py-3">
            <small className="text-muted">© 2026 Sistema Integrado APAE</small>
        </div>
      </div>
    </div>
  );
}