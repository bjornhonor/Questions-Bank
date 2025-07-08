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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      console.log("Tentando buscar questão com ID:", id);
      setLoading(true);
      setIsAnswered(false);
      setSelectedOption(null);
      setError('');

      try {
        const response = await axios.get(`http://localhost:5000/api/questions/${id}`);
        console.log("Resposta da API:", response.data);
        setQuestion(response.data);
      } catch (error) {
        console.error("Erro ao buscar a questão:", error);
        console.error("Status do erro:", error.response?.status);
        console.error("Dados do erro:", error.response?.data);
        
        if (error.response?.status === 404) {
          setError('Questão não encontrada');
        } else {
          setError('Erro ao carregar questão. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchQuestion();
    } else {
      console.error("ID da questão não encontrado na URL");
      setError('ID da questão não fornecido');
      setLoading(false);
    }
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

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Carregando questão...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <h3>😕 Ops! Algo deu errado</h3>
      <p>{error}</p>
      <Link to="/questions" style={styles.backButton}>
        ← Voltar ao Banco de Questões
      </Link>
    </div>
  );

  if (!question) return (
    <div style={styles.errorContainer}>
      <h3>😕 Questão não encontrada</h3>
      <p>A questão que você está procurando não existe ou foi removida.</p>
      <Link to="/questions" style={styles.backButton}>
        ← Voltar ao Banco de Questões
      </Link>
    </div>
  );

  const hasAttachments = question.attachments && question.attachments.length > 0;

  return (
    <div style={styles.container}>
      {/* O Modal (só é renderizado se isModalOpen for true) */}
      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>✕</button>
            <h3>Texto de Apoio</h3>
            {question.attachments.map((paragraph, index) => (
              <p key={index} style={styles.attachmentParagraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div style={styles.header}>
        <Link to="/questions" style={styles.backLink}>
          ← Voltar para o Banco de Questões
        </Link>

        {/* Botão para abrir o modal (só aparece se tiver anexo) */}
        {hasAttachments && (
          <button onClick={() => setIsModalOpen(true)} style={styles.attachmentButton}>
            📄 Ver Texto de Apoio
          </button>
        )}
      </div>

      <div style={styles.questionCard}>
        <div style={styles.questionMeta}>
          <span style={styles.area}>{question.area}</span>
          <span style={styles.topic}>{question.topic}</span>
        </div>
        
        <h3 style={styles.questionText}>{question.questionText}</h3>

        <div style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isAnswered}
              style={{
                ...styles.optionButton,
                backgroundColor: getButtonColor(index),
                border: selectedOption === index ? '2px solid #1a73e8' : '1px solid #dadce0',
                cursor: isAnswered ? 'default' : 'pointer',
              }}
            >
              <span style={styles.optionLetter}>{String.fromCharCode(65 + index)})</span>
              <span style={styles.optionText}>{option}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleCheckAnswer} 
          disabled={isAnswered || selectedOption === null} 
          style={{
            ...styles.checkButton,
            opacity: (isAnswered || selectedOption === null) ? 0.6 : 1,
            cursor: (isAnswered || selectedOption === null) ? 'not-allowed' : 'pointer'
          }}
        >
          {isAnswered ? 'Questão Respondida' : 'Verificar Resposta'}
        </button>

        {isAnswered && (
          <div style={styles.resultContainer}>
            {selectedOption === question.correctOptionIndex ? (
              <div style={styles.correctResult}>
                <span style={styles.resultIcon}>🎉</span>
                <h3 style={styles.resultText}>Parabéns! Resposta correta!</h3>
              </div>
            ) : (
              <div style={styles.incorrectResult}>
                <span style={styles.resultIcon}>😔</span>
                <h3 style={styles.resultText}>Resposta incorreta</h3>
                <p style={styles.correctAnswerText}>
                  A resposta correta é: <strong>{String.fromCharCode(65 + question.correctOptionIndex)})</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff3f3',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backLink: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '8px 0',
  },
  attachmentButton: {
    padding: '10px 16px',
    backgroundColor: '#fbbc04',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  questionCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #dadce0',
  },
  questionMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  area: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  topic: {
    backgroundColor: '#f3e8ff',
    color: '#7c3aed',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  questionText: {
    fontSize: '1.3rem',
    lineHeight: '1.6',
    color: '#202124',
    marginBottom: '30px',
    fontWeight: '500',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '30px',
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '16px 20px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '1rem',
    lineHeight: '1.5',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  optionLetter: {
    fontWeight: 'bold',
    color: '#1a73e8',
    minWidth: '20px',
  },
  optionText: {
    flex: 1,
    color: '#202124',
  },
  checkButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#34a853',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
    marginBottom: '20px',
  },
  resultContainer: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid',
  },
  correctResult: {
    borderColor: '#34a853',
    backgroundColor: '#f0f9f0',
    color: '#34a853',
  },
  incorrectResult: {
    borderColor: '#ea4335',
    backgroundColor: '#fef7f7',
    color: '#ea4335',
  },
  resultIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '10px',
  },
  resultText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  correctAnswerText: {
    fontSize: '1rem',
    margin: 0,
    color: '#5f6368',
  },
  attachmentParagraph: {
    lineHeight: '1.6',
    marginBottom: '15px',
    color: '#202124',
  },
};

export default SingleQuestionPage;