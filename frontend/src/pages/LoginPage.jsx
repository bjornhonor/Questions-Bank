// /frontend/src/pages/LoginPage.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Estilos (pode reutilizar os do RegisterPage se quiser)
const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '0 auto' };
const inputStyle = { margin: '8px 0', padding: '10px', fontSize: '1em' };
const buttonStyle = { padding: '10px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };
const errorStyle = { color: 'red', marginTop: '10px' };

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext); // Pega a função de login do nosso contexto
  const navigate = useNavigate(); // Hook para redirecionar o usuário

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/'); // Redireciona para a página inicial após o login
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Entrar</button>

        {error && <p style={errorStyle}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;