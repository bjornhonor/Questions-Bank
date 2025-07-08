// /frontend/src/components/PrivateRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
  const { userInfo } = useContext(AuthContext);

  // Se o usuário estiver logado (userInfo existe), renderiza o conteúdo da rota (Outlet).
  // Se não, redireciona para a página de login.
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;