// /frontend/src/pages/QuestionsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';
import DebugInfo from '../components/DebugInfo';

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ area: '', topic: '' });
  const [allAreas, setAllAreas] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

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

  if (loading) {
    return <p>Carregando questões...</p>;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2>Banco de Questões ({questions.length})</h2>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={styles.debugToggle}
        >
          {showDebug ? '🔧 Ocultar Debug' : '🔧 Mostrar Debug'}
        </button>
      </div>

      {/* Componente de Debug (temporário) */}
      {showDebug && <DebugInfo />}

      <div style={{ marginBottom: '20px' }}>
        <select name="area" value={filters.area} onChange={handleFilterChange}>
          <option value="">Todas as Áreas</option>
          {allAreas.map(area => <option key={area} value={area}>{area}</option>)}
        </select>

        <select name="topic" value={filters.topic} onChange={handleFilterChange} style={{ marginLeft: '10px' }}>
          <option value="">Todos os Temas</option>
          {allTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </div>

      <div>
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))
        ) : (
          <div style={styles.emptyState}>
            <h3>😕 Nenhuma questão encontrada</h3>
            <p>
              {filters.area || filters.topic 
                ? 'Tente alterar os filtros ou limpar a busca.' 
                : 'Parece que não há questões carregadas no sistema.'}
            </p>
            {!filters.area && !filters.topic && (
              <div style={styles.helpText}>
                <p><strong>Possíveis soluções:</strong></p>
                <ul>
                  <li>Verifique se o banco de dados está conectado</li>
                  <li>Execute <code>npm run seed</code> no backend para carregar as questões</li>
                  <li>Use o debug acima para investigar o problema</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  debugToggle: {
    padding: '8px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dadce0',
  },
  helpText: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    textAlign: 'left',
    maxWidth: '500px',
    margin: '20px auto 0',
  },
};

export default QuestionsPage;