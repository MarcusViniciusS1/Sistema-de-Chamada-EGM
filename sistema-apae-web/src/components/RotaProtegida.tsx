import { Navigate } from 'react-router-dom';

interface RotaProtegidaProps {
  children: JSX.Element;
  perfisPermitidos: string[]; // Ex: ['ADMIN', 'MONITOR']
}

export function RotaProtegida({ children, perfisPermitidos }: RotaProtegidaProps) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

  // 1. Se não tiver usuário, manda pro Login
  if (!usuarioLogado) {
    return <Navigate to="/" replace />;
  }

  // 2. Se o perfil do usuário não estiver na lista permitida, manda pra uma página de erro ou home
  // O ADMIN sempre tem acesso (bypass) se incluirmos ele em todas as listas, 
  // mas aqui garantimos que se o array não tiver o perfil dele, bloqueia.
  if (!perfisPermitidos.includes(usuarioLogado.perfil)) {
    alert("Acesso Negado: Seu perfil não tem permissão para acessar esta página.");
    return <Navigate to="/" replace />; // Ou manda de volta pro login
  }

  // 3. Se passou, mostra a página
  return children;
}