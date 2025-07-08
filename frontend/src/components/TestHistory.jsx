// /frontend/src/components/TestHistory.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function TestHistory({ showTitle = true, limit = null }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userInfo?.token) return;

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const params = { page: currentPage };
        if (limit) params.limit = limit;

        const response = await axios.get('http://localhost:5000/api/dashboard/history', {
          ...config,
          params
        });

        setHistory(response.data.results);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setError('Erro ao carregar histórico de testes');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userInfo, currentPage, limit]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#34a853';
    if (score >= 60) return '#fbbc04';
    if (score >= 40) return '#ff9800';
    return '#ea4335';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  if (loading) return <div style={styles.loading}>Carregando histórico...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      {showTitle && (
        <div style={styles.headerSection}>
          <h3 style={styles.title}>Histórico de Testes</h3>
          {limit && history.length >= limit && (
            <Link to="/history" style={styles.viewAllLink}>
              Ver histórico completo →
            </Link>
          )}
        </div>
      )}
      
      {history.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h4 style={styles.emptyTitle}>Nenhum teste realizado</h4>
          <p style={styles.emptyText}>
            Comece realizando um teste para ver seu histórico aqui!
          </p>
        </div>
      ) : (
        <>
          <div style={styles.historyList}>
            {history.map((result) => (
              <HistoryCard key={result._id} result={result} />
            ))}
          </div>

          {/* Paginação - só mostra se não há limite ou se há mais páginas */}
          {pagination && !limit && pagination.total > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>
              
              <span style={styles.pageInfo}>
                Página {currentPage} de {pagination.total}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasMore}
                style={{
                  ...styles.pageButton,
                  opacity: !pagination.hasMore ? 0.5 : 1,
                  cursor: !pagination.hasMore ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Componente para cada item do histórico
const HistoryCard = ({ result }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#34a853';
    if (score >= 60) return '#fbbc04';
    if (score >= 40) return '#ff9800';
    return '#ea4335';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div style={styles.historyCard}>
      <div style={styles.cardHeader}>
        <div style={styles.scoreSection}>
          <span style={styles.scoreIcon}>{getScoreIcon(result.score)}</span>
          <span style={{ ...styles.scoreText, color: getScoreColor(result.score) }}>
            {result.score}%
          </span>
        </div>
        <div style={styles.dateSection}>
          <span style={styles.dateText}>{result.date}</span>
          <span style={styles.timeText}>{result.time}</span>
        </div>
      </div>
      
      <div style={styles.cardContent}>
        <div style={styles.questionStats}>
          <span style={styles.statItem}>
            <strong>{result.correctAnswers}</strong> de <strong>{result.totalQuestions}</strong> corretas
          </span>
        </div>
        
        {/* Barra de progresso */}
        <div style={styles.progressContainer}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${result.score}%`,
              backgroundColor: getScoreColor(result.score)
            }}
          />
        </div>

        {/* Performance por matéria (se disponível) */}
        {result.performanceBySubject && Object.keys(result.performanceBySubject).length > 0 && (
          <div style={styles.subjectPerformance}>
            <span style={styles.subjectTitle}>Performance por área:</span>
            <div style={styles.subjectList}>
              {Object.entries(result.performanceBySubject).map(([subject, perf]) => (
                <span key={subject} style={styles.subjectItem}>
                  {subject}: {perf.correct}/{perf.total}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: {
    width: '100%',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#202124',
  },
  viewAllLink: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#5f6368',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: '#ea4335',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#202124',
  },
  emptyText: {
    fontSize: '1rem',
    lineHeight: '1.5',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  historyCard: {
    backgroundColor: 'white',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scoreIcon: {
    fontSize: '1.5rem',
  },
  scoreText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  dateSection: {
    textAlign: 'right',
  },
  dateText: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#202124',
  },
  timeText: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#5f6368',
    marginTop: '2px',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    fontSize: '1rem',
    color: '#202124',
  },
  progressContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f1f3f4',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  subjectPerformance: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e8eaed',
  },
  subjectTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#5f6368',
    display: 'block',
    marginBottom: '8px',
  },
  subjectList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  subjectItem: {
    fontSize: '0.85rem',
    padding: '4px 8px',
    backgroundColor: 'white',
    border: '1px solid #dadce0',
    borderRadius: '12px',
    color: '#202124',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '30px',
    padding: '20px',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  pageInfo: {
    fontSize: '1rem',
    color: '#5f6368',
    fontWeight: '500',
  },
};

export default TestHistory;