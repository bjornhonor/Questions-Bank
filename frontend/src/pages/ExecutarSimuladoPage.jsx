// Função para ir para a primeira questão não respondida
  const goToFirstUnansweredQuestion = () => {
    const firstUnanswered = questoes.findIndex((_, index) => selectedAnswers[index] === undefined);
    if (firstUnanswered !== -1) {
      setCurrentQuestionIndex(firstUnanswered);
    }
  };// /frontend/src/pages/ExecutarSimuladoPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useTimer from '../hooks/useTimer';

const API_BASE_URL = 'http://localhost:5000';

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
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [showIncompleteQuestions, setShowIncompleteQuestions] = useState(false);
  
  // Estados do modal de anexos
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Hook do timer
  const timer = useTimer(false);

  useEffect(() => {
    buscarSimulado();
  }, [ano, numero]);

  // Effect para esconder aviso e questões vermelhas quando todas questões forem respondidas
  useEffect(() => {
    if ((showIncompleteWarning || showIncompleteQuestions) && Object.keys(selectedAnswers).length === questoes.length) {
      setShowIncompleteWarning(false);
      setShowIncompleteQuestions(false);
    }
  }, [selectedAnswers, questoes.length, showIncompleteWarning, showIncompleteQuestions]);

  const buscarSimulado = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_BASE_URL}/api/simulados/${ano}/${numero}`);
      
      if (response.data.success) {
        setSimulado(response.data.simulado);
        setQuestoes(response.data.simulado.questoes);
      } else {
        setError('Simulado não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar simulado:', error);
      setError('Erro ao carregar simulado');
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    timer.start();
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  // Função para ir para a primeira questão não respondida
  const goToFirstUnansweredQuestion = () => {
    const firstUnanswered = questoes.findIndex((_, index) => selectedAnswers[index] === undefined);
    if (firstUnanswered !== -1) {
      setCurrentQuestionIndex(firstUnanswered);
    }
  };

  const finishTest = () => {
    // Verificar se todas as questões foram respondidas
    const totalQuestoes = questoes.length;
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

    timer.stop();
    
    // Calcular resultados
    let correctAnswers = 0;
    const detailedResults = questoes.map((questao, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer === questao.correctOptionIndex;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index + 1,
        question: questao.questionText,
        userAnswer: userAnswer !== undefined ? questao.options[userAnswer] : 'Não respondida',
        correctAnswer: questao.options[questao.correctOptionIndex],
        isCorrect,
        area: questao.area,
        topic: questao.topic
      };
    });

    const score = Math.round((correctAnswers / questoes.length) * 100);

    setResults({
      score,
      correctAnswers,
      totalQuestions: questoes.length,
      timeElapsed: timer.timeElapsed,
      detailedResults
    });

    setTestFinished(true);
  };

  // Função para verificar se é URL de imagem
  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    const urlPattern = /^(https?:\/\/|\.\.?\/|\/)/;
    return urlPattern.test(url) && imageExtensions.test(url);
  };

  // Função para obter texto do botão baseado no tipo de conteúdo
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

  const currentQuestion = questoes[currentQuestionIndex];

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onBack={() => navigate(`/simulados/${ano}`)} />;
  if (!simulado) return <ErrorScreen error="Simulado não encontrado" onBack={() => navigate(`/simulados/${ano}`)} />;

  if (!testStarted) {
    return <PreTestPage simulado={simulado} onStart={startTest} onBack={() => navigate(`/simulados/${ano}`)} />;
  }

  if (testFinished) {
    return <ResultsPage results={results} simulado={simulado} onRestart={() => window.location.reload()} navigate={navigate} />;
  }

  return (
    <div style={styles.container}>
      {/* Header com informações do simulado */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.simuladoTitle}>{simulado.nome}</h1>
          <div style={styles.headerStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Questão:</span>
              <span style={styles.statValue}>{currentQuestionIndex + 1} / {questoes.length}</span>
            </div>

      {/* Barra de Navegação Inferior Fixa */}
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
              {currentQuestionIndex + 1} de {questoes.length}
            </span>
            <span style={styles.bottomNavSubtext}>
              {Object.keys(selectedAnswers).length} respondidas
            </span>
          </div>

          {currentQuestionIndex === questoes.length - 1 ? (
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
              onClick={() => setCurrentQuestionIndex(Math.min(questoes.length - 1, currentQuestionIndex + 1))}
              style={{
                ...styles.bottomNavButton,
                backgroundColor: '#007bff',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
              }}
            >
              Próxima →
            </button>
          )}
        </div>
      </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Tempo:</span>
              <span style={styles.statValue}>{timer.formattedTime}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Respondidas:</span>
              <span style={styles.statValue}>{Object.keys(selectedAnswers).length} / {questoes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={styles.content}>
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
                <strong>Atenção!</strong> Você precisa responder todas as questões antes de finalizar o simulado.
                <br />
                <span style={styles.warningSubtext}>
                  Ainda faltam {questoes.length - Object.keys(selectedAnswers).length} questões para responder.
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

        <div style={styles.questionSection}>
          {/* Área da questão */}
          <div style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <div style={styles.questionInfo}>
                <span style={styles.questionArea}>{currentQuestion.area}</span>
                <span style={styles.questionTopic}>{currentQuestion.topic}</span>
              </div>
              
              {/* Botão de anexos - só aparece se houver attachments */}
              {currentQuestion.attachments && currentQuestion.attachments.length > 0 && (
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  style={styles.attachmentButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  📎 {getButtonText(currentQuestion.attachments)}
                </button>
              )}
            </div>

            <div style={styles.questionText}>
              {currentQuestion.questionText}
            </div>

            {/* Opções de resposta */}
            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
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

        {/* Barra de navegação - só números das questões */}
        <div style={styles.navigationSection}>
          <div style={styles.navigationCard}>
            <div style={styles.questionNavContainer}>
              <span style={styles.questionNavLabel}>Ir para questão:</span>
              <div style={styles.questionNav}>
                {questoes.map((_, index) => {
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
                            ? 'Questão não respondida - clique para responder'
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

      {/* Modal de Anexos */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsModalOpen(false);
          }
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.color = '#495057';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.color = '#6c757d';
              }}
            >
              ✕
            </button>
            
            <h3 style={styles.modalTitle}>
              📎 Material de Apoio
            </h3>
            
            <div style={styles.modalAttachments}>
              {currentQuestion.attachments.map((content, index) => {
                const isImage = isImageUrl(content);
                const prevIsImage = index > 0 ? isImageUrl(currentQuestion.attachments[index - 1]) : false;
                
                return (
                  <div key={index}>
                    {/* Separador visual entre tipos diferentes de conteúdo */}
                    {index > 0 && isImage !== prevIsImage && (
                      <div style={styles.contentSeparator}></div>
                    )}
                    
                    {isImage ? (
                      <div style={styles.imageContainer}>
                        <img 
                          src={content} 
                          alt={`Material de apoio ${index + 1}`}
                          style={styles.attachmentImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.style.cssText = `
                              display: inline-block; padding: 20px; background-color: #f8d7da;
                              border: 1px solid #f5c6cb; border-radius: 8px; color: #721c24; margin: 15px 0;
                            `;
                            errorDiv.textContent = `⚠️ Erro ao carregar imagem: ${content}`;
                            e.target.parentNode.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    ) : (
                      <p style={styles.attachmentText}>{content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente LoadingScreen
const LoadingScreen = () => (
  <div style={styles.loadingContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>Carregando simulado...</p>
  </div>
);

// Componente ErrorScreen
const ErrorScreen = ({ error, onBack }) => (
  <div style={styles.errorContainer}>
    <h2>❌ Erro</h2>
    <p>{error}</p>
    <button onClick={onBack} style={styles.backButton}>
      Voltar
    </button>
  </div>
);

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
        <h1 style={styles.resultsTitle}>🎯 Resultado do Simulado</h1>
        
        <div style={styles.scoreSection}>
          <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
            <span style={{ ...styles.scoreNumber, color: scoreColor }}>{results.score}%</span>
          </div>
          <p style={styles.scoreText}>
            {results.correctAnswers} de {results.totalQuestions} questões corretas
          </p>
          <p style={styles.timeText}>
            Tempo total: {results.timeElapsed}
          </p>
        </div>

        <div style={styles.resultActions}>
          <button onClick={onRestart} style={styles.restartButton}>
            🔄 Tentar Novamente
          </button>
          <button onClick={() => navigate(`/simulados/${simulado.ano}`)} style={styles.backToListButton}>
            📚 Outros Simulados
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '80px' // Espaço para a barra inferior fixa
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

  simuladoTitle: {
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

  questionNavContainer: {
    // Removido borderTop e paddingTop já que não há mais botões acima
  },

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

  // Aviso de questões incompletas
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

  // Barra de navegação inferior fixa
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
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },

  bottomNavButtonDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#adb5bd',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },

  bottomNavButtonPrevious: {
    backgroundColor: '#6c757d',
    color: 'white',
    boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
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
    color: '#6c757d',
    fontWeight: '500'
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },

  modalContent: {
    backgroundColor: 'white',
    padding: '20px 30px 30px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '950px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)'
  },

  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    padding: '10px 14px',
    backgroundColor: '#f8f9fa',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#6c757d',
    transition: 'all 0.2s ease',
    zIndex: 10
  },

  modalTitle: {
    margin: '0 0 25px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
    borderBottom: '3px solid #e9ecef',
    paddingBottom: '12px'
  },

  modalAttachments: {
    marginBottom: 0
  },

  attachmentImage: {
    maxWidth: '100%',
    height: 'auto',
    margin: '20px 0',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    display: 'block'
  },

  imageContainer: {
    textAlign: 'center',
    margin: '20px 0'
  },

  attachmentText: {
    marginBottom: '18px',
    lineHeight: '1.7',
    fontSize: '16px',
    color: '#333',
    textAlign: 'justify'
  },

  contentSeparator: {
    height: '1px',
    background: 'linear-gradient(to right, transparent, #ddd, transparent)',
    margin: '25px 0'
  },

  // Loading, Error, PreTest, Results styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px'
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  loadingText: {
    fontSize: '1.2rem',
    color: '#6c757d',
    fontWeight: '500'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
    padding: '20px'
  },

  backButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },

  preTestContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },

  preTestCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  },

  preTestHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },

  preTestTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '10px'
  },

  preTestSubtitle: {
    fontSize: '1.2rem',
    color: '#6c757d',
    fontWeight: '400'
  },

  preTestInfo: {
    marginBottom: '40px'
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },

  infoItem: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },

  infoNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#667eea',
    marginBottom: '8px'
  },

  infoLabel: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontWeight: '500'
  },

  areasInfo: {
    marginBottom: '30px'
  },

  areasTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px'
  },

  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },

  areaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },

  areaName: {
    fontWeight: '500',
    color: '#2d3748'
  },

  areaCount: {
    fontWeight: '600',
    color: '#667eea'
  },

  instructions: {
    backgroundColor: '#f0f4ff',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },

  instructionsTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px'
  },

  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4a5568'
  },

  preTestActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },

  backButtonPre: {
    padding: '15px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },

  startButton: {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },

  resultsContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },

  resultsCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  },

  resultsTitle: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '30px'
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
    fontSize: '1.3rem',
    color: '#2d3748',
    fontWeight: '500',
    marginBottom: '10px'
  },

  timeText: {
    fontSize: '1.1rem',
    color: '#6c757d'
  },

  resultActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },

  restartButton: {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600'
  },

  backToListButton: {
    padding: '15px 30px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600'
  }
};

// Adicionar CSS de animação
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
    
    .infoGrid {
      grid-template-columns: 1fr !important;
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
  const existingStyle = document.getElementById('executar-simulado-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'executar-simulado-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default ExecutarSimuladoPage;