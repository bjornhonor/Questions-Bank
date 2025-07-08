// /frontend/src/pages/SimuladosPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const SimuladosPage = () => {
  const [anos, setAnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    buscarAnos();
  }, []);

  const buscarAnos = async () => {
    try {
      setLoading(true);
      
      // Por enquanto, vamos focar apenas no ano 2017 que temos as questões
      const anosSimulados = [
        { ano: 2017, totalQuestoes: 50 }  // Corrigido para 50 questões
      ];
      
      setAnos(anosSimulados);
      
    } catch (error) {
      console.error('Erro ao buscar anos:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAnoClick = (ano) => {
    // Agora navegamos para a página do ano (próximo passo de implementação)
    navigate(`/simulados/${ano}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando simulados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Erro ao carregar</h3>
        <p style={styles.errorText}>{error}</p>
        <button onClick={buscarAnos} style={styles.retryButton}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Simulados</h1>
          <p style={styles.subtitle}>
            Pratique com simulados organizados por ano. Para 2017: 5 simulados de 10 questões cada, respeitando as proporções originais da prova.
          </p>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{anos.length}</div>
              <div style={styles.statLabel}>Anos Disponíveis</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{anos.length * 5}</div>
              <div style={styles.statLabel}>Simulados Totais</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>10</div>
              <div style={styles.statLabel}>Questões por Simulado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Anos Section */}
      <div style={styles.anosSection}>
        <h2 style={styles.sectionTitle}>Escolha o Ano</h2>
        <div style={styles.anosGrid}>
          {anos.map((anoInfo) => (
            <AnoCard 
              key={anoInfo.ano} 
              anoInfo={anoInfo} 
              onClick={() => handleAnoClick(anoInfo.ano)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente AnoCard
const AnoCard = ({ anoInfo, onClick }) => {
  return (
    <div style={styles.anoCard} onClick={onClick}>
      <div style={styles.anoCardHeader}>
        <div style={styles.anoNumber}>{anoInfo.ano}</div>
        <div style={styles.anoMeta}>
          <span style={styles.simuladosCount}>5 Simulados</span>
        </div>
      </div>
      
      <div style={styles.anoCardBody}>
        <div style={styles.questoesInfo}>
          <span style={styles.questoesCount}>{anoInfo.totalQuestoes}</span>
          <span style={styles.questoesLabel}>questões base</span>
        </div>
        
        <div style={styles.descricaoSimulado}>
          Cada simulado contém 10 questões selecionadas respeitando a proporção original das áreas
        </div>
      </div>
      
      <div style={styles.anoCardFooter}>
        <button style={styles.iniciarButton}>
          Acessar Simulados →
        </button>
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    backgroundColor: '#f8f9fa',
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e3f2fd',
    borderTop: '4px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },

  loadingText: {
    color: '#6c757d',
    fontSize: '1.1em',
    fontWeight: '500',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },

  errorIcon: {
    fontSize: '4em',
    marginBottom: '20px',
  },

  errorTitle: {
    color: '#dc3545',
    fontSize: '1.5em',
    fontWeight: '600',
    marginBottom: '10px',
  },

  errorText: {
    color: '#6c757d',
    marginBottom: '30px',
    lineHeight: '1.5',
  },

  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '60px 40px',
    textAlign: 'center',
  },

  titleSection: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  title: {
    fontSize: '3em',
    fontWeight: '700',
    marginBottom: '15px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '1.2em',
    opacity: 0.9,
    marginBottom: '40px',
    maxWidth: '600px',
    margin: '0 auto 40px auto',
    lineHeight: '1.6',
  },

  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },

  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '140px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },

  statNumber: {
    fontSize: '2.2em',
    fontWeight: '700',
    marginBottom: '8px',
  },

  statLabel: {
    fontSize: '0.9em',
    opacity: 0.9,
    fontWeight: '500',
  },

  anosSection: {
    padding: '60px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  sectionTitle: {
    fontSize: '2.2em',
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '50px',
  },

  anosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
  },

  anoCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
  },

  anoCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },

  anoNumber: {
    fontSize: '2.5em',
    fontWeight: '700',
    color: '#1a73e8',
    lineHeight: '1',
  },

  anoMeta: {
    textAlign: 'right',
  },

  simuladosCount: {
    backgroundColor: '#e3f2fd',
    color: '#1a73e8',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '600',
  },

  anoCardBody: {
    marginBottom: '25px',
  },

  questoesInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '15px',
  },

  questoesCount: {
    fontSize: '1.8em',
    fontWeight: '600',
    color: '#2c3e50',
  },

  questoesLabel: {
    color: '#6c757d',
    fontSize: '0.9em',
  },

  descricaoSimulado: {
    color: '#6c757d',
    lineHeight: '1.5',
    fontSize: '0.95em',
  },

  anoCardFooter: {
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px',
  },

  iniciarButton: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// CSS para animações - Simplificado
const animationCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .simulados-container {
    padding: 0 20px !important;
  }
  
  .simulados-header {
    padding: 40px 20px !important;
  }
  
  .simulados-title {
    font-size: 2.2em !important;
  }
  
  .simulados-grid {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
  }
}
`;

// Adicionar CSS no documento
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('simulados-page-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'simulados-page-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default SimuladosPage;