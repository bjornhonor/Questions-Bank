// /frontend/src/pages/SingleQuestionPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// --- Estilos para o Modal (para manter o JSX limpo) ---
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px 40px 40px 40px',
  borderRadius: '8px',
  width: '70%',
  maxWidth: '800px',
  height: '80%',
  overflowY: 'auto', // Permite a rolagem
  position: 'relative'
};

const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#eee'
}
// --------------------------------------------------------

function SingleQuestionPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para o modal

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setIsAnswered(false);
      setSelectedOption(null);

      try {
        const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
        setQuestion(response.data);
      } catch (error) {
        console.error("Erro ao buscar a questão:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
  };

  const getButtonColor = (index) => {
    if (!isAnswered) return 'white';
    const isCorrectAnswer = index === question.correctOptionIndex;
    const isSelectedAnswer = index === selectedOption;
    if (isCorrectAnswer) return 'lightgreen';
    if (isSelectedAnswer && !isCorrectAnswer) return 'salmon';
    return 'white';
  };

  if (loading) return <p>Carregando questão...</p>;
  if (!question) return <p>Questão não encontrada.</p>;

  const hasAttachments = question.attachments && question.attachments.length > 0;

  return (
    <div>
      {/* O Modal (só é renderizado se isModalOpen for true) */}
      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>X</button>
            <h3>Texto de Apoio</h3>
            {question.attachments.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>
      )}

      <Link to="/questions" style={{ textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Voltar para o Banco de Questões
      </Link>

      {/* Botão para abrir o modal (só aparece se tiver anexo) */}
      {hasAttachments && (
        <button onClick={() => setIsModalOpen(true)} style={{ marginLeft: '20px' }}>
          Ver Texto de Apoio
        </button>
      )}

      <h3>{question.area} - {question.topic}</h3>
      <p>{question.questionText}</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(index)}
            disabled={isAnswered}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              margin: '5px 0',
              padding: '10px',
              backgroundColor: getButtonColor(index),
              border: selectedOption === index ? '2px solid #007bff' : '1px solid #ccc',
              cursor: isAnswered ? 'default' : 'pointer',
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <button 
        onClick={handleCheckAnswer} 
        disabled={isAnswered || selectedOption === null} 
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Corrigir
      </button>

      {isAnswered && (
        <div style={{ marginTop: '15px' }}>
          {selectedOption === question.correctOptionIndex ? 
            <h2 style={{ color: 'green' }}>Correto!</h2> : 
            <h2 style={{ color: 'red' }}>Incorreto!</h2>
          }
        </div>
      )}
    </div>
  );
}

export default SingleQuestionPage;