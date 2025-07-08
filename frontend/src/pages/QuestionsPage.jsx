// /frontend/src/pages/QuestionsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ area: '', topic: '' });
  const [allAreas, setAllAreas] = useState([]);
  const [allTopics, setAllTopics] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/questions', {
          params: filters,
        });

        const fetchedQuestions = response.data;
        setQuestions(fetchedQuestions);

        if (filters.area === '' && filters.topic === '') {
          const uniqueAreas = [...new Set(fetchedQuestions.map(q => q.area))];
          const uniqueTopics = [...new Set(fetchedQuestions.map(q => q.topic))];
          setAllAreas(uniqueAreas);
          setAllTopics(uniqueTopics);
        }

      } catch (error) {
        console.error("Erro ao buscar questões:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchQuestions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ area: '', topic: '' });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando questões...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Banco de Questões</h1>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{questions.length}</div>
              <div style={styles.statLabel}>Questões Encontradas</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{allAreas.length}</div>
              <div style={styles.statLabel}>Áreas Disponíveis</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{allTopics.length}</div>
              <div style={styles.statLabel}>Tópicos Disponíveis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filtrar por Área:</label>
            <select 
              name="area" 
              value={filters.area} 
              onChange={handleFilterChange}
              style={styles.filterSelect}
            >
              <option value="">Todas as Áreas</option>
              {allAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filtrar por Tópico:</label>
            <select 
              name="topic" 
              value={filters.topic} 
              onChange={handleFilterChange}
              style={styles.filterSelect}
            >
              <option value="">Todos os Tópicos</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {(filters.area || filters.topic) && (
            <button 
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {(filters.area || filters.topic) && (
          <div style={styles.activeFilters}>
            <span style={styles.activeFiltersLabel}>Filtros ativos:</span>
            {filters.area && (
              <span style={styles.filterTag}>
                Área: {filters.area}
              </span>
            )}
            {filters.topic && (
              <span style={styles.filterTag}>
                Tópico: {filters.topic}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div style={styles.questionsSection}>
        {questions.length > 0 ? (
          <div style={styles.questionsGrid}>
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🔍</div>
            <h3 style={styles.noResultsTitle}>Nenhuma questão encontrada</h3>
            <p style={styles.noResultsText}>
              Tente ajustar os filtros ou limpar os filtros para ver todas as questões disponíveis.
            </p>
            <button onClick={clearFilters} style={styles.showAllButton}>
              Ver Todas as Questões
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '1.1em',
  },

  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },

  titleSection: {
    textAlign: 'center',
  },

  title: {
    fontSize: '2.5em',
    fontWeight: '700',
    margin: '0 0 30px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },

  statCard: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    minWidth: '120px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s ease',
  },

  statNumber: {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },

  statLabel: {
    fontSize: '0.9em',
    opacity: '0.9',
  },

  filtersSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
  },

  filtersContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'end',
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    flex: '1',
  },

  filterLabel: {
    fontSize: '0.9em',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '8px',
  },

  filterSelect: {
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1em',
    backgroundColor: 'white',
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },

  clearButton: {
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    height: 'fit-content',
  },

  activeFilters: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },

  activeFiltersLabel: {
    fontSize: '0.9em',
    fontWeight: '600',
    color: '#495057',
  },

  filterTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8em',
    fontWeight: '500',
  },

  questionsSection: {
    minHeight: '400px',
  },

  questionsGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
  },

  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },

  noResultsIcon: {
    fontSize: '4em',
    marginBottom: '20px',
  },

  noResultsTitle: {
    fontSize: '1.5em',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '10px',
  },

  noResultsText: {
    color: '#6c757d',
    marginBottom: '30px',
    lineHeight: '1.5',
  },

  showAllButton: {
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
};

// Inserir CSS para animação do spinner
const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

select:focus, button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

button:hover {
  filter: brightness(1.05);
}

button:active {
  transform: translateY(0);
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.3);
}

.filter-select:hover {
  border-color: #1a73e8;
  background-color: #f8f9ff;
}

.clear-button:hover {
  background-color: #c82333;
}

.show-all-button:hover {
  background-color: #1557b0;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .header {
    padding: 30px 20px;
  }
  
  .title {
    font-size: 2em !important;
  }
  
  .statsContainer {
    gap: 15px !important;
  }
  
  .statCard {
    min-width: 100px !important;
    padding: 15px !important;
  }
  
  .filtersContainer {
    flex-direction: column;
    gap: 15px !important;
  }
  
  .filterGroup {
    min-width: auto !important;
  }
  
  .questionsGrid {
    grid-template-columns: 1fr !important;
    gap: 15px !important;
  }
}
`;

// Inserir CSS no documento se estiver no navegador
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('questions-page-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'questions-page-styles';
    style.textContent = spinnerCSS;
    document.head.appendChild(style);
  }
}

export default QuestionsPage;