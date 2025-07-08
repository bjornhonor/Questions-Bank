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
import TestsPage from './pages/TestsPage';
import SimuladosPage from './pages/SimuladosPage';
import AnoSimuladosPage from './pages/AnoSimuladosPage';
import ExecutarSimuladoPage from './pages/ExecutarSimuladoPage';
import RedacaoPage from './pages/RedacaoPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

// O componente Navigation atualizado com link para Simulados
const Navigation = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '0 40px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {/* Mostra os links principais APENAS se o usuário estiver logado */}
          {userInfo && (
            <>
              <Link to="/" style={linkStyle}>Início</Link>
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              <Link to="/questions" style={linkStyle}>Banco de Questões</Link>
              <Link to="/tests" style={linkStyle}>Testes</Link>
              <Link to="/simulados" style={linkStyle}>Simulados</Link>
            </>
          )}
        </div>
        <div>
          {userInfo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ color: '#5f6368' }}>Olá, {userInfo.name}</span>
              <button onClick={handleLogout} style={buttonStyle}>Sair</button>
            </div>
          ) : (
            <>
              <Link to="/login" style={{ ...linkStyle, marginRight: '20px' }}>Login</Link>
              <Link to="/register" style={{ ...linkStyle, color: '#28a745' }}>Registrar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// Estilos para a navegação
const linkStyle = {
  textDecoration: 'none',
  color: '#1a73e8',
  fontWeight: '500',
  fontSize: '1rem',
  padding: '8px 16px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#ea4335',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontWeight: '500',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s ease',
};

// O componente App principal com as rotas
function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main style={{ padding: '20px 40px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
        <Routes>
          {/* --- Rotas Públicas --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- Rotas Protegidas --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:id" element={<SingleQuestionPage />} />
            <Route path="/random-test" element={<RandomTestPage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/simulados" element={<SimuladosPage />} />
            <Route path="/simulados/:ano" element={<AnoSimuladosPage />} />
            <Route path="/simulados/:ano/:numero/executar" element={<ExecutarSimuladoPage />} />
            <Route path="/redacao" element={<RedacaoPage />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;