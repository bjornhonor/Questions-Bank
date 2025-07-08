// /frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

function HomePage() {
  const linkStyle = { /* ... seu estilo aqui ... */ };
  return (
    <div>
      <h2>Página Inicial</h2>
      <p>Bem-vinda à sua plataforma de estudos!</p>
      <Link to="/random-test" style={linkStyle}>
        Iniciar Teste Aleatório
      </Link>
    </div>
  );
}
export default HomePage;