// /frontend/src/pages/AnoSimuladosPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const AnoSimuladosPage = () => {
  const { ano } = useParams();
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proporcoes, setProporcoes] = useState({});

  useEffect(() => {
    buscarSimulados();
  }, [ano]);

  const buscarSimulados = async () => {
    try {
      setLoading(true);
      
      // Buscar simulados reais da API
      const response = await axios.get(`${API_BASE_URL}/api/simulados/${ano}`);
      
      if (response.data.success) {
        setSimulados(response.data.simulados);
        
        // Se há simulados, usar as proporções do primeiro
        if (response.data.simulados.length > 0) {
          setProporcoes(response.data.simulados[0].proporcoes);
        }
      } else {
        setError('Erro ao carregar simulados');
      }
      
    } catch (error) {
      console.error('Erro ao buscar simulados:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSimuladoClick = (simulado) => {
    navigate(`/simulados/${ano}/${simulado.numero}/executar`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Preparando simulados de {ano}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Erro ao carregar</h3>
        <p style={styles.errorText}>{error}</p>
        <button onClick={buscarSimulados} style={styles.retryButton}>
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
          <Link to="/simulados" style={styles.backLink}>
            ← Voltar aos Anos
          </Link>
          <h1 style={styles.title}>Simulados {ano}</h1>
          <p style={styles.subtitle}>
            5 simulados únicos com {simulados.length > 0 ? simulados[0].totalQuestoes : '10-12'} questões cada, mantendo as proporções originais da prova de {ano}
          </p>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{simulados.length}</div>
              <div style={styles.statLabel}>Simulados</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{simulados.length > 0 ? simulados[0].totalQuestoes : 10}</div>
              <div style={styles.statLabel}>Questões Cada</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{Object.keys(proporcoes).length}</div>
              <div style={styles.statLabel}>Áreas Cobertas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulados Section */}
      <div style={styles.simuladosSection}>
        <h2 style={styles.sectionTitle}>Escolha um Simulado</h2>
        
        {/* Proporções Section */}
        {Object.keys(proporcoes).length > 0 && (
          <div style={styles.proporcoesContainer}>
            <h3 style={styles.proporcoesTitle}>Distribuição por Área ({simulados.length > 0 ? simulados[0].totalQuestoes : 10} questões)</h3>
            <div style={styles.proporcoesGrid}>
              {Object.entries(proporcoes).map(([area, info]) => (
                <div key={area} style={styles.proporcaoCard}>
                  <div style={styles.proporcaoArea}>{area}</div>
                  <div style={styles.proporcaoInfo}>
                    <span style={styles.proporcaoQuestoes}>
                      {info.questoesSimulado} questões
                    </span>
                    <span style={styles.proporcaoPorcentagem}>
                      ({info.porcentagem.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulados Grid */}
        <div style={styles.simuladosGrid}>
          {simulados.map((simulado, index) => (
            <SimuladoCard 
              key={simulado.id} 
              simulado={simulado} 
              index={index}
              onClick={() => handleSimuladoClick(simulado)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente SimuladoCard
const SimuladoCard = ({ simulado, index, onClick }) => {
  const cores = [
    '#1a73e8', '#34a853', '#ea4335', '#fbbc05', '#9aa0a6'
  ];
  
  const cor = cores[index % cores.length];

  return (
    <div style={{...styles.simuladoCard, borderTopColor: cor}} onClick={onClick}>
      <div style={styles.simuladoHeader}>
        <div style={{...styles.simuladoNumero, color: cor}}>
          {simulado.nome}
        </div>
        <div style={styles.simuladoStatus}>
          <span style={{...styles.statusBadge, backgroundColor: cor + '20', color: cor}}>
            Pronto
          </span>
        </div>
      </div>
      
      <div style={styles.simuladoBody}>
        <div style={styles.simuladoInfo}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Questões:</span>
            <span style={styles.infoValue}>{simulado.totalQuestoes}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Áreas:</span>
            <span style={styles.infoValue}>5</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Tempo sugerido:</span>
            <span style={styles.infoValue}>{Math.round(simulado.totalQuestoes * 2)} min</span>
          </div>
        </div>

        <div style={styles.simuladoDescricao}>
          Simulado #{simulado.numero} - Questões selecionadas aleatoriamente respeitando 
          as proporções originais da prova de {simulado.ano}
        </div>
      </div>
      
      <div style={styles.simuladoFooter}>
        <button style={{...styles.iniciarButton, backgroundColor: cor}}>
          Iniciar Simulado →
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
  },

  titleSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },

  backLink: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontSize: '1em',
    fontWeight: '500',
    marginBottom: '20px',
    display: 'inline-block',
    transition: 'color 0.3s ease',
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

  simuladosSection: {
    padding: '60px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  sectionTitle: {
    fontSize: '2.2em',
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '40px',
  },

  proporcoesContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '50px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  proporcoesTitle: {
    fontSize: '1.4em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
  },

  proporcoesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },

  proporcaoCard: {
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.05)',
  },

  proporcaoArea: {
    fontSize: '0.95em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
    lineHeight: '1.3',
  },

  proporcaoInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  proporcaoQuestoes: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: '0.9em',
  },

  proporcaoPorcentagem: {
    color: '#6c757d',
    fontSize: '0.85em',
  },

  simuladosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
  },

  simuladoCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.05)',
    borderTop: '4px solid #1a73e8',
    position: 'relative',
    overflow: 'hidden',
  },

  simuladoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },

  simuladoNumero: {
    fontSize: '2em',
    fontWeight: '700',
    lineHeight: '1',
  },

  simuladoStatus: {
    textAlign: 'right',
  },

  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '600',
  },

  simuladoBody: {
    marginBottom: '25px',
  },

  simuladoInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  infoLabel: {
    color: '#6c757d',
    fontSize: '0.85em',
    fontWeight: '500',
  },

  infoValue: {
    color: '#2c3e50',
    fontSize: '1.1em',
    fontWeight: '600',
  },

  simuladoDescricao: {
    color: '#6c757d',
    lineHeight: '1.5',
    fontSize: '0.95em',
  },

  simuladoFooter: {
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px',
  },

  iniciarButton: {
    width: '100%',
    padding: '14px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// CSS para animações
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
  const existingStyle = document.getElementById('ano-simulados-page-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'ano-simulados-page-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default AnoSimuladosPage;