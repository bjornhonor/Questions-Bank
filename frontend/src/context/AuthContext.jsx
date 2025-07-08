// /frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito para checar se já existe um usuário logado no localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    setLoading(false);
  }, []);

  // Função de Login
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, message };
    }
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;