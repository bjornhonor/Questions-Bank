// /frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// Importar componentes
import PrivateRoute from './components/PrivateRoute';

// Importar todas as páginas
import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import SingleQuestionPage from './pages/SingleQuestionPage';
import RandomTestPage from './pages/RandomTestPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// O componente Navigation agora também esconde links
const Navigation = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '0 40px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <div>
          {/* Mostra os links principais APENAS se o usuário estiver logado */}
          {userInfo && (
            <>
              <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', marginRight: '20px' }}>Início</Link>
              <Link to="/questions" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Banco de Questões</Link>
            </>
          )}
        </div>
        <div>
          {userInfo ? (
            <>
              <span style={{ marginRight: '20px' }}>Olá, {userInfo.name}</span>
              <button onClick={handleLogout} style={{ fontWeight: 'bold' }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', marginRight: '20px' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', color: '#28a745', fontWeight: 'bold' }}>Registrar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// O componente App principal com a rota da Home protegida
function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main style={{ padding: '20px 40px' }}>
        <Routes>
          {/* --- Rotas Públicas --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- Rotas Protegidas --- */}
          {/* O PrivateRoute agora "abraça" TODAS as páginas principais */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} /> {/* <-- A HOME AGORA ESTÁ PROTEGIDA */}
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:id" element={<SingleQuestionPage />} />
            <Route path="/random-test" element={<RandomTestPage />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;