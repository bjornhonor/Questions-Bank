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

  if (loading) {
    return <p>Carregando questões...</p>;
  }

  return (
    <div>
      <h2>Banco de Questões ({questions.length})</h2>

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
          <p>Nenhuma questão encontrada para os filtros selecionados.</p>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;