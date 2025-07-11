// /frontend/src/pages/RandomTestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const RandomTestPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testState, setTestState] = useState('loading'); // 'loading', 'active', 'finished', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [showIncompleteQuestions, setShowIncompleteQuestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    generateRandomTest();
  }, []);

  // Effect para esconder aviso e questões vermelhas quando todas questões forem respondidas
  useEffect(() => {
    if ((showIncompleteWarning || showIncompleteQuestions) && Object.keys(selectedAnswers).length === questions.length) {
      setShowIncompleteWarning(false);
      setShowIncompleteQuestions(false);
    }
  }, [selectedAnswers, questions.length, showIncompleteWarning, showIncompleteQuestions]);

  const generateRandomTest = async () => {
    try {
      setTestState('loading');
      setErrorMessage('');
      
      const response = await axios.get(`${API_BASE_URL}/api/questions/random?count=5`);
      
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setTestState('active');
      } else {
        setErrorMessage('Não há questões suficientes disponíveis para gerar um teste.');
        setTestState('error');
      }
    } catch (error) {
      console.error('Erro ao gerar teste aleatório:', error);
      setErrorMessage('Erro ao conectar com o servidor. Tente novamente.');
      setTestState('error');
    }
  };

  const handleSelectOption = (optionIndex) => {
    if (testState === 'finished') return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const finishTest = () => {
    // Verificar se todas as questões foram respondidas
    const totalQuestoes = questions.length;
    const questoesRespondidas = Object.keys(selectedAnswers).length;
    
    if (questoesRespondidas < totalQuestoes) {
      setShowIncompleteWarning(true); // Banner de alerta
      setShowIncompleteQuestions(true); // Questões ficam vermelhas
      // Banner se esconde após 5 segundos, mas questões continuam vermelhas
      setTimeout(() => {
        setShowIncompleteWarning(false);
        // showIncompleteQuestions continua true até todas serem respondidas
      }, 5000);
      return;
    }

    // Se chegou aqui, todas as questões foram respondidas
    setTestState('finished');
  };

  // Função para ir para a primeira questão não respondida
  const goToFirstUnansweredQuestion = () => {
    const firstUnanswered = questions.findIndex((_, index) => selectedAnswers[index] === undefined);
    if (firstUnanswered !== -1) {
      setCurrentQuestionIndex(firstUnanswered);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  // Funções auxiliares para modal de anexos
  const isImageUrl = (url) => {
    if (typeof url !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    const urlPattern = /^(https?:\/\/|\.\.?\/|\/)/;
    return urlPattern.test(url) && imageExtensions.test(url);
  };

  const getButtonText = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return 'Ver Material de Apoio';
    }

    const hasImages = attachments.some(isImageUrl);
    const hasText = attachments.some(content => !isImageUrl(content));

    if (hasImages && hasText) {
      return 'Ver Material de Apoio';
    } else if (hasImages) {
      return 'Ver Imagens';
    } else {
      return 'Ver Texto de Apoio';
    }
  };

  const renderAttachmentContent = (content, index) => {
    if (isImageUrl(content)) {
      return (
        <div key={index} style={{ textAlign: 'center', margin: '20px 0' }}>
          <img 
            src={content} 
            alt={`Material de apoio ${index + 1}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              margin: '15px 0',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = `
                display: inline-block;
                padding: 20px;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                color: #721c24;
                margin: 15px 0;
              `;
              errorDiv.textContent = `⚠️ Erro ao carregar imagem: ${content}`;
              e.target.parentNode.appendChild(errorDiv);
            }}
          />
        </div>
      );
    } else {
      return (
        <p key={index} style={{
          marginBottom: '15px',
          lineHeight: '1.6',
          fontSize: '16px',
          color: '#333',
          whiteSpace: 'pre-wrap'
        }}>
          {content}
        </p>
      );
    }
  };

  // Estados de loading e erro
  if (testState === 'loading') {
    return <LoadingScreen />;
  }

  if (testState === 'error') {
    return <ErrorScreen error={errorMessage} onRetry={generateRandomTest} />;
  }

  if (testState === 'finished') {
    const results = calculateResults();
    return <ResultsPage results={results} onRestart={generateRandomTest} navigate={navigate} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.container}>
      {/* Aviso de questões incompletas */}
      {showIncompleteWarning && (
        <div style={styles.warningBanner}>
          <div 
            style={styles.warningContent}
            onClick={goToFirstUnansweredQuestion}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fff8e1';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff3cd';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span style={styles.warningIcon}>⚠️</span>
            <div style={styles.warningText}>
              <strong>Atenção!</strong> Você precisa responder todas as questões antes de finalizar o teste.
              <br />
              <span style={styles.warningSubtext}>
                Ainda faltam {questions.length - Object.keys(selectedAnswers).length} questões para responder.
                <br />
                <em style={{ fontSize: '0.85rem', color: '#6c5005' }}>
                  Clique aqui para ir à primeira questão não respondida. As questões não respondidas ficarão destacadas em vermelho.
                </em>
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowIncompleteWarning(false);
                // Não resetar showIncompleteQuestions - elas devem continuar vermelhas
              }}
              style={styles.warningCloseButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(133, 100, 4, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header com informações do teste */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.testTitle}>🎲 Teste Aleatório</h1>
          <div style={styles.headerStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Questão:</span>
              <span style={styles.statValue}>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Respondidas:</span>
              <span style={styles.statValue}>{Object.keys(selectedAnswers).length} / {questions.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Área:</span>
              <span style={styles.statValue}>{currentQuestion.area || 'Geral'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de questões incompletas */}
      {showIncompleteWarning && (
        <div style={styles.warningBanner}>
          <div 
            style={styles.warningContent}
            onClick={goToFirstUnansweredQuestion}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fff8e1';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff3cd';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span style={styles.warningIcon}>⚠️</span>
            <div style={styles.warningText}>
              <strong>Atenção!</strong> Você precisa responder todas as questões antes de finalizar o teste.
              <br />
              <span style={styles.warningSubtext}>
                Ainda faltam {questions.length - Object.keys(selectedAnswers).length} questões para responder.
                <br />
                <em style={{ fontSize: '0.85rem', color: '#6c5005' }}>
                  Clique aqui para ir à primeira questão não respondida. As questões não respondidas ficarão destacadas em vermelho.
                </em>
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowIncompleteWarning(false);
                // Não resetar showIncompleteQuestions - elas devem continuar vermelhas
              }}
              style={styles.warningCloseButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(133, 100, 4, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div style={styles.content}>
        {/* Seção da questão */}
        <div style={styles.questionSection}>
          <div style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <div style={styles.questionInfo}>
                <div style={styles.questionArea}>{currentQuestion.area || 'Área Geral'}</div>
                <div style={styles.questionTopic}>{currentQuestion.topic || 'Tópico não especificado'}</div>
              </div>
              
              {currentQuestion.attachments && currentQuestion.attachments.length > 0 && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={styles.attachmentButton}
                >
                  📎 {getButtonText(currentQuestion.attachments)}
                </button>
              )}
            </div>

            <div style={styles.questionText}>
              {currentQuestion.questionText}
            </div>

            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  style={{
                    ...styles.optionButton,
                    ...(selectedAnswers[currentQuestionIndex] === index ? styles.optionSelected : {})
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnswers[currentQuestionIndex] !== index) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnswers[currentQuestionIndex] !== index) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span style={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                  <span style={styles.optionText}>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navegação lateral */}
        <div style={styles.navigationSection}>
          <div style={styles.navigationCard}>
            <div style={styles.questionNavContainer}>
              <span style={styles.questionNavLabel}>Ir para questão:</span>
              <div style={styles.questionNav}>
                {questions.map((_, index) => {
                  const isAnswered = selectedAnswers[index] !== undefined;
                  const isCurrent = index === currentQuestionIndex;
                  const shouldShowAsIncomplete = showIncompleteQuestions && !isAnswered;
                  
                  let buttonStyle = { ...styles.questionNavButton };
                  
                  if (isCurrent) {
                    buttonStyle = { ...buttonStyle, ...styles.questionNumberActive };
                  } else if (isAnswered) {
                    buttonStyle = { ...buttonStyle, ...styles.questionNumberAnswered };
                  } else if (shouldShowAsIncomplete) {
                    buttonStyle = { ...buttonStyle, ...styles.questionNumberIncomplete };
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      style={buttonStyle}
                      title={
                        isAnswered 
                          ? 'Questão respondida' 
                          : shouldShowAsIncomplete 
                            ? 'Questão não respondida' 
                            : 'Questão não respondida'
                      }
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de navegação inferior fixa */}
      <div style={styles.bottomNavigation}>
        <div style={styles.bottomNavContent}>
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            style={{
              ...styles.bottomNavButton,
              ...(currentQuestionIndex === 0 ? styles.bottomNavButtonDisabled : styles.bottomNavButtonPrevious)
            }}
            onMouseEnter={(e) => {
              if (currentQuestionIndex !== 0) {
                e.target.style.backgroundColor = '#5a6268';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentQuestionIndex !== 0) {
                e.target.style.backgroundColor = '#6c757d';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            ← Anterior
          </button>

          <div style={styles.bottomNavInfo}>
            <span style={styles.bottomNavText}>
              {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span style={styles.bottomNavSubtext}>
              {Object.keys(selectedAnswers).length} respondidas
            </span>
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={finishTest}
              style={{
                ...styles.bottomNavButton,
                backgroundColor: '#dc3545',
                color: 'white',
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
              }}
            >
              🏁 Finalizar
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              style={{
                ...styles.bottomNavButton,
                backgroundColor: '#667eea',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a67d8';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              Próxima →
            </button>
          )}
        </div>
      </div>

      {/* Modal para anexos */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={styles.modalCloseButton}
            >
              ✕
            </button>
            <h3 style={styles.modalTitle}>
              Material de Apoio - Questão {currentQuestionIndex + 1}
            </h3>
            <div style={styles.modalBody}>
              {currentQuestion.attachments?.map((content, index) => 
                renderAttachmentContent(content, index)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Loading
const LoadingScreen = () => (
  <div style={styles.centerScreen}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>Gerando teste aleatório...</p>
  </div>
);

// Componente de Erro
const ErrorScreen = ({ error, onRetry }) => (
  <div style={styles.centerScreen}>
    <div style={styles.errorIcon}>⚠️</div>
    <h3 style={styles.errorTitle}>Erro ao carregar teste</h3>
    <p style={styles.errorText}>{error}</p>
    <button onClick={onRetry} style={styles.retryButton}>
      Tentar Novamente
    </button>
  </div>
);

// Componente de Resultados
const ResultsPage = ({ results, onRestart, navigate }) => {
  const scoreColor = results.percentage >= 70 ? '#28a745' : results.percentage >= 50 ? '#ffc107' : '#dc3545';

  return (
    <div style={styles.resultsContainer}>
      <div style={styles.resultsCard}>
        <h1 style={styles.resultsTitle}>🎯 Resultado do Teste</h1>
        
        <div style={styles.scoreSection}>
          <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
            <span style={{ ...styles.scoreNumber, color: scoreColor }}>{results.percentage}%</span>
          </div>
          <p style={styles.scoreText}>
            {results.correct} de {results.total} questões corretas
          </p>
        </div>

        <div style={styles.resultActions}>
          <button onClick={onRestart} style={styles.restartButton}>
            🔄 Novo Teste
          </button>
          <button onClick={() => navigate('/questions')} style={styles.backToListButton}>
            📚 Banco de Questões
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos (baseados no ExecutarSimuladoPage)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '80px'
  },

  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
  },

  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },

  testTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },

  headerStats: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  },

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },

  statLabel: {
    fontSize: '0.85rem',
    color: '#6c757d',
    fontWeight: '500'
  },

  statValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#667eea'
  },

  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '30px'
  },

  questionSection: {
    display: 'flex',
    flexDirection: 'column'
  },

  questionCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },

  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
  },

  questionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  questionArea: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#667eea'
  },

  questionTopic: {
    fontSize: '0.95rem',
    color: '#6c757d'
  },

  attachmentButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
  },

  questionText: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    color: '#2d3748',
    marginBottom: '30px',
    fontWeight: '400'
  },

  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  optionButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '18px 20px',
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    fontSize: '1rem',
    lineHeight: '1.5'
  },

  optionSelected: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.15)'
  },

  optionLetter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '50%',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#495057',
    flexShrink: 0
  },

  optionText: {
    flex: 1,
    color: '#2d3748'
  },

  navigationSection: {
    position: 'sticky',
    top: '20px',
    height: 'fit-content'
  },

  navigationCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },

  questionNavContainer: {},

  questionNavLabel: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: '12px',
    display: 'block'
  },

  questionNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px'
  },

  questionNavButton: {
    width: '40px',
    height: '40px',
    border: '2px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#495057',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  questionNumberActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    color: 'white'
  },

  questionNumberAnswered: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
    color: 'white'
  },

  questionNumberIncomplete: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    color: 'white',
    animation: 'pulse 2s infinite'
  },

  warningBanner: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200,
    width: '90%',
    maxWidth: '600px',
    animation: 'slideDown 0.3s ease'
  },

  warningContent: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  warningIcon: {
    fontSize: '24px',
    flexShrink: 0
  },

  warningText: {
    flex: 1,
    color: '#856404',
    fontSize: '1rem',
    lineHeight: '1.5'
  },

  warningSubtext: {
    fontSize: '0.9rem',
    fontWeight: 'normal',
    opacity: 0.8
  },

  warningCloseButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    color: '#856404',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    flexShrink: 0
  },

  bottomNavigation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '2px solid #e2e8f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
    zIndex: 100,
    padding: '15px 0'
  },

  bottomNavContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px'
  },

  bottomNavButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '120px'
  },

  bottomNavButtonPrevious: {
    backgroundColor: '#6c757d',
    color: 'white'
  },

  bottomNavButtonDisabled: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    cursor: 'not-allowed'
  },

  bottomNavInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },

  bottomNavText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748'
  },

  bottomNavSubtext: {
    fontSize: '0.9rem',
    color: '#6c757d'
  },

  // Modal styles
  modalOverlay: {
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
  },

  modalContent: {
    backgroundColor: 'white',
    padding: '20px 40px 40px 40px',
    borderRadius: '12px',
    width: '70%',
    maxWidth: '800px',
    height: '80%',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },

  modalCloseButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    padding: '8px 12px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(244, 67, 54, 0.3)'
  },

  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '20px',
  },

  modalBody: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#2d3748',
  },

  // Loading/Error screens
  centerScreen: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e3f2fd',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },

  loadingText: {
    color: '#6c757d',
    fontSize: '1.1em',
    fontWeight: '500',
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
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Results screen
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f8fafc',
    padding: '40px 20px'
  },

  resultsCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },

  resultsTitle: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '40px'
  },

  scoreSection: {
    marginBottom: '40px'
  },

  scoreCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '8px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },

  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: '700'
  },

  scoreText: {
    fontSize: '1.2rem',
    color: '#4a5568',
    marginBottom: '10px'
  },

  resultActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  restartButton: {
    padding: '15px 30px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600'
  },

  backToListButton: {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600'
  }
};

// CSS para animações
const animationCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  @keyframes slideDown {
    0% { 
      opacity: 0; 
      transform: translateX(-50%) translateY(-20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(-50%) translateY(0); 
    }
  }

  @media (max-width: 768px) {
    .content {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    
    .navigationSection {
      position: static !important;
    }
    
    .headerContent {
      flex-direction: column !important;
      text-align: center !important;
    }
    
    .headerStats {
      justify-content: center !important;
    }
    
    .questionNav {
      grid-template-columns: repeat(4, 1fr) !important;
    }
    
    .bottomNavContent {
      padding: 0 15px !important;
      gap: 10px !important;
    }
    
    .bottomNavButton {
      min-width: 80px !important;
      padding: 10px 16px !important;
      font-size: 0.9rem !important;
    }
    
    .bottomNavInfo {
      gap: 2px !important;
    }
    
    .bottomNavText {
      font-size: 1rem !important;
    }
    
    .bottomNavSubtext {
      font-size: 0.8rem !important;
    }
    
    .warningBanner {
      width: 95% !important;
      top: 70px !important;
    }
    
    .warningContent {
      padding: 15px !important;
      gap: 12px !important;
    }
    
    .warningText {
      font-size: 0.9rem !important;
    }
  }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('random-test-page-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'random-test-page-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default RandomTestPage;