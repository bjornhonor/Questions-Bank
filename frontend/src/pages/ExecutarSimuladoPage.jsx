const API_BASE_URL = 'http://localhost:5000';// /frontend/src/pages/ExecutarSimuladoPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useTimer from '../hooks/useTimer';
import ImageModal from '../components/ImageModal';

const ExecutarSimuladoPage = () => {
  const { ano, numero } = useParams();
  const navigate = useNavigate();
  
  // Estados do simulado
  const [simulado, setSimulado] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados do teste
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [results, setResults] = useState(null);
  
  // Estados do modal de imagem
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Hook do timer
  const timer = useTimer(false);

  useEffect(() => {
    buscarSimulado();
  }, [ano, numero]);

  const buscarSimulado = async () => {
    try {
      setLoading(true);
      
      // Buscar simulado real da API
      const response = await axios.get(`${API_BASE_URL}/api/simulados/${ano}/${numero}`);
      
      if (response.data.success) {
        setSimulado(response.data.simulado);
        setQuestoes(response.data.simulado.questoes);
      } else {
        setError('Simulado não encontrado');
      }
      
    } catch (error) {
      console.error('Erro ao buscar simulado:', error);
      setError('Erro ao carregar o simulado');
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    timer.start();
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questoes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const finishTest = () => {
    timer.stop();
    
    // Calcular resultados
    let correctAnswers = 0;
    const questionResults = questoes.map((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correctOptionIndex;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        question: question,
        selectedAnswer: selectedAnswers[index],
        correctAnswer: question.correctOptionIndex,
        isCorrect: isCorrect
      };
    });

    const score = (correctAnswers / questoes.length) * 100;

    const testResults = {
      simuladoNome: simulado.nome,
      totalQuestions: questoes.length,
      correctAnswers: correctAnswers,
      incorrectAnswers: questoes.length - correctAnswers,
      score: score,
      timeElapsed: timer.getElapsedTime(),
      questionResults: questionResults,
      areas: simulado.proporcoes
    };

    setResults(testResults);
    setTestFinished(true);
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestStarted(false);
    setTestFinished(false);
    setResults(null);
    timer.reset();
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando simulado...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Erro</h3>
        <p style={styles.errorText}>{error}</p>
        <Link to={`/simulados/${ano}`} style={styles.backButton}>
          Voltar aos Simulados
        </Link>
      </div>
    );
  }

  // Results page
  if (testFinished && results) {
    return <ResultsPage results={results} simulado={simulado} onRestart={restartTest} navigate={navigate} />;
  }

  // Pre-test page
  if (!testStarted) {
    return (
      <PreTestPage 
        simulado={simulado} 
        onStart={startTest} 
        onBack={() => navigate(`/simulados/${ano}`)} 
      />
    );
  }

  // Test execution
  const currentQuestion = questoes[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questoes.length) * 100;

  return (
    <div style={styles.testContainer}>
      {/* Header com progresso */}
      <div style={styles.testHeader}>
        <div style={styles.headerLeft}>
          <h2 style={styles.simuladoTitle}>{simulado.nome}</h2>
          <div style={styles.progressInfo}>
            Questão {currentQuestionIndex + 1} de {questoes.length}
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.timer}>
            Tempo: {timer.formatTime()}
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={styles.progressBar}>
        <div style={{...styles.progressFill, width: `${progress}%`}}></div>
      </div>

      {/* Questão atual */}
      <div style={styles.questionContainer}>
        <div style={styles.questionHeader}>
          <span style={styles.questionArea}>{currentQuestion.area}</span>
          <span style={styles.questionTopic}>{currentQuestion.topic}</span>
        </div>

        <div style={styles.questionText}>
          {currentQuestion.questionText}
        </div>

        {/* Anexos se existirem */}
        {currentQuestion.attachments && currentQuestion.attachments.length > 0 && (
          <div style={styles.attachments}>
            {currentQuestion.attachments.map((attachment, index) => (
              <div key={index} style={styles.attachment}>
                {attachment.endsWith('.png') || attachment.endsWith('.jpg') || 
                 attachment.endsWith('.jpeg') || attachment.endsWith('.gif') ? (
                  <div style={styles.imageAttachment}>
                    <img 
                      src={attachment} 
                      alt={`Anexo ${index + 1}`} 
                      style={styles.attachmentImageThumb}
                      onClick={() => openImageModal(attachment)}
                    />
                    <button 
                      onClick={() => openImageModal(attachment)}
                      style={styles.expandImageButton}
                    >
                      🔍 Ampliar Imagem
                    </button>
                  </div>
                ) : (
                  <div style={styles.attachmentText}>{attachment}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Opções de resposta */}
        <div style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(currentQuestionIndex, index)}
              style={{
                ...styles.optionButton,
                ...(selectedAnswer === index ? styles.optionSelected : {})
              }}
            >
              <span style={{
                ...styles.optionLetter,
                ...(selectedAnswer === index ? styles.optionLetterSelected : {})
              }}>
                {String.fromCharCode(65 + index)}
              </span>
              <span style={styles.optionText}>{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navegação */}
      <div style={styles.navigationContainer}>
        <div style={styles.navButtons}>
          <button 
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              ...styles.navButton,
              ...(currentQuestionIndex === 0 ? styles.navButtonDisabled : {})
            }}
          >
            ← Anterior
          </button>

          {currentQuestionIndex === questoes.length - 1 ? (
            <button 
              onClick={finishTest}
              style={{...styles.navButton, ...styles.finishButton}}
            >
              Finalizar Simulado
            </button>
          ) : (
            <button 
              onClick={nextQuestion}
              style={styles.navButton}
            >
              Próxima →
            </button>
          )}
        </div>

        {/* Mini navegador de questões */}
        <div style={styles.questionNavigator}>
          {questoes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              style={{
                ...styles.questionNumber,
                ...(index === currentQuestionIndex ? styles.questionNumberActive : {}),
                ...(selectedAnswers[index] !== undefined ? styles.questionNumberAnswered : {})
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal de Imagem */}
      <ImageModal 
        isOpen={isModalOpen}
        onClose={closeImageModal}
        imageUrl={modalImage}
        title="Anexo da Questão"
      />
    </div>
  );
};

// Componente PreTestPage
const PreTestPage = ({ simulado, onStart, onBack }) => (
  <div style={styles.preTestContainer}>
    <div style={styles.preTestCard}>
      <div style={styles.preTestHeader}>
        <h1 style={styles.preTestTitle}>{simulado.nome}</h1>
        <p style={styles.preTestSubtitle}>
          Simulado baseado nas questões de {simulado.ano}
        </p>
      </div>

      <div style={styles.preTestInfo}>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoNumber}>{simulado.totalQuestoes}</div>
            <div style={styles.infoLabel}>Questões</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoNumber}>{Math.round(simulado.totalQuestoes * 2)}</div>
            <div style={styles.infoLabel}>Minutos sugeridos</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoNumber}>{Object.keys(simulado.proporcoes).length}</div>
            <div style={styles.infoLabel}>Áreas</div>
          </div>
        </div>

        <div style={styles.areasInfo}>
          <h3 style={styles.areasTitle}>Distribuição por Área:</h3>
          <div style={styles.areasGrid}>
            {Object.entries(simulado.proporcoes).map(([area, info]) => (
              <div key={area} style={styles.areaItem}>
                <span style={styles.areaName}>{area}</span>
                <span style={styles.areaCount}>{info.questoesSimulado} questões</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>Instruções:</h3>
          <ul style={styles.instructionsList}>
            <li>Leia cada questão com atenção</li>
            <li>Selecione apenas uma alternativa por questão</li>
            <li>Você pode navegar entre as questões livremente</li>
            <li>O tempo é apenas sugestivo, não há limite</li>
            <li>Clique em "Finalizar" quando terminar</li>
          </ul>
        </div>
      </div>

      <div style={styles.preTestActions}>
        <button onClick={onBack} style={styles.backButtonPre}>
          Voltar
        </button>
        <button onClick={onStart} style={styles.startButton}>
          Iniciar Simulado
        </button>
      </div>
    </div>
  </div>
);

// Componente ResultsPage
const ResultsPage = ({ results, simulado, onRestart, navigate }) => {
  const scoreColor = results.score >= 70 ? '#28a745' : results.score >= 50 ? '#ffc107' : '#dc3545';

  return (
    <div style={styles.resultsContainer}>
      <div style={styles.resultsCard}>
        <div style={styles.resultsHeader}>
          <h1 style={styles.resultsTitle}>Resultado do Simulado</h1>
          <h2 style={styles.simuladoNameResult}>{results.simuladoNome}</h2>
        </div>

        <div style={styles.scoreSection}>
          <div style={{...styles.scoreCircle, borderColor: scoreColor}}>
            <span style={{...styles.scoreNumber, color: scoreColor}}>
              {results.score.toFixed(1)}%
            </span>
          </div>
          <div style={styles.scoreInfo}>
            <div style={styles.scoreStats}>
              <span style={{...styles.correctCount, color: '#28a745'}}>
                ✓ {results.correctAnswers} acertos
              </span>
              <span style={{...styles.incorrectCount, color: '#dc3545'}}>
                ✗ {results.incorrectAnswers} erros
              </span>
            </div>
            <div style={styles.timeInfo}>
              Tempo total: {useTimer().formatTime(results.timeElapsed)}
            </div>
          </div>
        </div>

        <div style={styles.resultsActions}>
          <button onClick={onRestart} style={styles.restartButton}>
            Refazer Simulado
          </button>
          <button 
            onClick={() => navigate(`/simulados/${simulado.ano}`)} 
            style={styles.backToSimuladosButton}
          >
            Outros Simulados
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos
const styles = {
  // Loading e Error styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
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
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },

  errorIcon: { fontSize: '4em', marginBottom: '20px' },
  errorTitle: { color: '#dc3545', fontSize: '1.5em', marginBottom: '10px' },
  errorText: { color: '#6c757d', marginBottom: '30px' },

  backButton: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '600',
  },

  // Pre-test styles
  preTestContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },

  preTestCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },

  preTestHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  preTestTitle: {
    fontSize: '2.5em',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
  },

  preTestSubtitle: {
    fontSize: '1.2em',
    color: '#6c757d',
  },

  preTestInfo: {
    marginBottom: '40px',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
    marginBottom: '30px',
    textAlign: 'center',
  },

  infoItem: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },

  infoNumber: {
    fontSize: '2em',
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: '5px',
  },

  infoLabel: {
    color: '#6c757d',
    fontSize: '0.9em',
    fontWeight: '500',
  },

  areasInfo: {
    marginBottom: '30px',
  },

  areasTitle: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '15px',
  },

  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },

  areaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '0.9em',
  },

  areaName: {
    fontWeight: '500',
    color: '#2c3e50',
  },

  areaCount: {
    color: '#1a73e8',
    fontWeight: '600',
  },

  instructions: {},

  instructionsTitle: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '15px',
  },

  instructionsList: {
    color: '#6c757d',
    lineHeight: '1.8',
    paddingLeft: '20px',
  },

  preTestActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },

  backButtonPre: {
    padding: '15px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
  },

  startButton: {
    padding: '15px 40px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // Test execution styles
  testContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },

  testHeader: {
    backgroundColor: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {},

  simuladoTitle: {
    fontSize: '1.5em',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0,
  },

  progressInfo: {
    color: '#6c757d',
    fontSize: '0.9em',
    marginTop: '5px',
  },

  headerRight: {},

  timer: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#1a73e8',
    padding: '8px 16px',
    backgroundColor: '#e3f2fd',
    borderRadius: '20px',
  },

  progressBar: {
    height: '4px',
    backgroundColor: '#e9ecef',
    position: 'relative',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    transition: 'width 0.3s ease',
  },

  questionContainer: {
    flex: 1,
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },

  questionHeader: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  questionArea: {
    fontSize: '1.1em',
    fontWeight: '600',
    color: '#1a73e8',
  },

  questionTopic: {
    fontSize: '0.95em',
    color: '#6c757d',
  },

  questionText: {
    fontSize: '1.3em',
    lineHeight: '1.6',
    color: '#2c3e50',
    marginBottom: '30px',
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  attachments: {
    marginBottom: '30px',
  },

  attachment: {
    marginBottom: '15px',
  },

  imageAttachment: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },

  attachmentImageThumb: {
    maxWidth: '300px',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },

  expandImageButton: {
    padding: '8px 16px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  attachmentText: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    fontFamily: 'monospace',
  },

  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    fontSize: '1.1em',
  },

  optionSelected: {
    borderColor: '#1a73e8',
    backgroundColor: '#e3f2fd',
  },

  optionLetter: {
    width: '35px',
    height: '35px',
    backgroundColor: '#6c757d',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1em',
    flexShrink: 0,
  },

  optionLetterSelected: {
    backgroundColor: '#1a73e8',
  },

  optionText: {
    flex: 1,
    lineHeight: '1.4',
  },

  navigationContainer: {
    backgroundColor: 'white',
    padding: '20px 40px',
    boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
  },

  navButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  navButton: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  navButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },

  finishButton: {
    backgroundColor: '#28a745',
  },

  questionNavigator: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },

  questionNumber: {
    width: '40px',
    height: '40px',
    border: '2px solid #e9ecef',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9em',
    fontWeight: '600',
    color: '#6c757d',
  },

  questionNumberActive: {
    borderColor: '#1a73e8',
    backgroundColor: '#1a73e8',
    color: 'white',
  },

  questionNumberAnswered: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
    color: '#155724',
  },

  // Results styles
  resultsContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },

  resultsCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },

  resultsHeader: {
    marginBottom: '40px',
  },

  resultsTitle: {
    fontSize: '2.2em',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
  },

  simuladoNameResult: {
    fontSize: '1.3em',
    color: '#1a73e8',
    fontWeight: '600',
  },

  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '40px',
  },

  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '6px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },

  scoreNumber: {
    fontSize: '1.8em',
    fontWeight: '700',
  },

  scoreInfo: {
    textAlign: 'left',
  },

  scoreStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px',
  },

  correctCount: {
    fontSize: '1.1em',
    fontWeight: '600',
  },

  incorrectCount: {
    fontSize: '1.1em',
    fontWeight: '600',
  },

  timeInfo: {
    color: '#6c757d',
    fontSize: '1em',
  },

  resultsActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },

  restartButton: {
    padding: '15px 30px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
  },

  backToSimuladosButton: {
    padding: '15px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// CSS para animações
const animationCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .test-header {
    padding: 15px 20px !important;
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .question-container {
    padding: 25px 20px !important;
  }
  
  .nav-container {
    padding: 15px 20px !important;
  }
  
  .nav-buttons {
    gap: 10px !important;
  }
  
  .question-navigator {
    gap: 6px !important;
  }
  
  .question-number {
    width: 35px !important;
    height: 35px !important;
    font-size: 0.85em !important;
  }
}
`;

// Adicionar CSS no documento
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('executar-simulado-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'executar-simulado-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default ExecutarSimuladoPage;