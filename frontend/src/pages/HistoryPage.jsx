// /frontend/src/pages/HistoryPage.jsx
import { Link } from 'react-router-dom';
import TestHistory from '../components/TestHistory';

function HistoryPage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>
          ← Voltar ao Dashboard
        </Link>
        <h2 style={styles.title}>Histórico Completo de Testes</h2>
        <p style={styles.subtitle}>
          Aqui você pode ver todos os seus testes realizados, com detalhes de pontuação e performance.
        </p>
      </div>
      
      <TestHistory showTitle={false} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  backLink: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'inline-block',
    marginBottom: '20px',
    padding: '8px 0',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#202124',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5f6368',
    lineHeight: '1.5',
  },
};

export default HistoryPage;