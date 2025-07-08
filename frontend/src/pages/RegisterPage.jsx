// /frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import axios from 'axios';

// Estilos simples para o formulário (opcional)
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '400px',
  margin: '0 auto',
};
const inputStyle = {
  margin: '8px 0',
  padding: '10px',
  fontSize: '1em',
};
const buttonStyle = {
  padding: '10px',
  fontSize: '1em',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: '10px'
};
const errorStyle = {
  color: 'red',
  marginTop: '10px'
};


function RegisterPage() {
  // Estados para guardar os dados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para feedback ao usuário
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Validação simples
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    setError('');
    setMessage('');

    try {
      // Faz a chamada para a nossa API de registro no backend
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name,
        email,
        password,
      });

      console.log('Usuário registrado:', response.data);
      setMessage('Usuário registrado com sucesso! Você já pode fazer o login.');

      // O ideal aqui seria redirecionar para a página de login, faremos isso depois.

    } catch (err) {
      // Pega a mensagem de erro que nosso backend envia (ex: "Usuário já existe")
      setError(err.response?.data?.message || 'Ocorreu um erro no registro.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Registrar Nova Conta</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label htmlFor="name">Nome:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

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

        <label htmlFor="confirmPassword">Confirmar Senha:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Registrar</button>

        {/* Exibe mensagens de sucesso ou erro */}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={errorStyle}>{error}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;