// /frontend/src/pages/SingleQuestionPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function SingleQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  // Effect para esconder aviso quando questão for respondida
  useEffect(() => {
    if (showIncompleteWarning && selectedOption !== null) {
      setShowIncompleteWarning(false);
    }
  }, [selectedOption, showIncompleteWarning]);

  const fetchQuestion = async () => {
    setLoading(true);
    setIsAnswered(false);
    setSelectedOption(null);
    setError('');
    setShowIncompleteWarning(false);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error("Erro ao buscar a questão:", error);
      setError('Questão não encontrada ou erro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      // Mostrar aviso se tentar verificar sem selecionar resposta
      setShowIncompleteWarning(true);
      setTimeout(() => {
        setShowIncompleteWarning(false);
      }, 3000);
      return;
    }
    setIsAnswered(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowIncompleteWarning(false);
  };

  const handleRandomQuestion = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/questions/random?count=1`);
      if (response.data && response.data.length > 0) {
        navigate(`/questions/${response.data[0]._id}`);
      }
    } catch (error) {
      console.error("Erro ao buscar questão aleatória:", error);
    }
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

  const getOptionColor = (index) => {
    if (!isAnswered) return 'white';
    const isCorrectAnswer = index === question.correctOptionIndex;
    const isSelectedAnswer = index === selectedOption;
    
    if (isCorrectAnswer) return '#d4edda';
    if (isSelectedAnswer && !isCorrectAnswer) return '#f8d7da';
    return 'white';
  };

  const getOptionBorderColor = (index) => {
    if (!isAnswered) {
      return selectedOption === index ? '#667eea' : '#e2e8f0';
    }
    const isCorrectAnswer = index === question.correctOptionIndex;
    const isSelectedAnswer = index === selectedOption;
    
    if (isCorrectAnswer) return '#28a745';
    if (isSelectedAnswer && !isCorrectAnswer) return '#dc3545';
    return '#e2e8f0';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !question) {
    return <ErrorScreen error={error} onBack={() => navigate('/questions')} />;
  }

  return (
    <div style={styles.container}>
      {/* Aviso de questão não respondida */}
      {showIncompleteWarning && (
        <div style={styles.warningBanner}>
          <div 
            style={styles.warningContent}
            onClick={() => setShowIncompleteWarning(false)}
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
              <strong>Atenção!</strong> Você precisa selecionar uma resposta antes de verificar.
              <br />
              <span style={styles.warningSubtext}>
                <em style={{ fontSize: '0.85rem', color: '#6c5005' }}>
                  Clique aqui para fechar este aviso.
                </em>
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowIncompleteWarning(false);
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

      {/* Header com informações da questão */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.questionTitle}>📋 Questão Individual</h1>
          <div style={styles.headerStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Área:</span>
              <span style={styles.statValue}>{question.area || 'Geral'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Tópico:</span>
              <span style={styles.statValue}>{question.topic || 'Não especificado'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Status:</span>
              <span style={styles.statValue}>
                {isAnswered ? (selectedOption === question.correctOptionIndex ? 'Correto' : 'Incorreto') : 'Não respondida'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={styles.content}>
        {/* Seção da questão */}
        <div style={styles.questionSection}>
          <div style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <div style={styles.questionInfo}>
                <div style={styles.questionArea}>{question.area || 'Área Geral'}</div>
                <div style={styles.questionTopic}>{question.topic || 'Tópico não especificado'}</div>
              </div>
              
              {question.attachments && question.attachments.length > 0 && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={styles.attachmentButton}
                >
                  📎 {getButtonText(question.attachments)}
                </button>
              )}
            </div>

            <div style={styles.questionText}>
              {question.questionText}
            </div>

            <div style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  style={{
                    ...styles.optionButton,
                    backgroundColor: getOptionColor(index),
                    borderColor: getOptionBorderColor(index),
                    ...(selectedOption === index && !isAnswered ? styles.optionSelected : {}),
                    cursor: isAnswered ? 'default' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAnswered && selectedOption !== index) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#667eea';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAnswered && selectedOption !== index) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span style={{
                    ...styles.optionLetter,
                    backgroundColor: selectedOption === index && !isAnswered ? '#667eea' : '#f8f9fa',
                    color: selectedOption === index && !isAnswered ? 'white' : '#495057'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={styles.optionText}>
                    {option}
                  </span>
                  {isAnswered && index === question.correctOptionIndex && (
                    <span style={styles.correctIcon}>✓</span>
                  )}
                  {isAnswered && index === selectedOption && index !== question.correctOptionIndex && (
                    <span style={styles.incorrectIcon}>✗</span>
                  )}
                </button>
              ))}
            </div>

            {/* Explicação (se disponível e respondida) */}
            {isAnswered && question.explanation && (
              <div style={styles.explanationSection}>
                <h4 style={styles.explanationTitle}>💡 Explicação</h4>
                <p style={styles.explanationText}>{question.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegação lateral */}
        <div style={styles.navigationSection}>
          <div style={styles.navigationCard}>
            <div style={styles.navigationHeader}>
              <h3 style={styles.navigationTitle}>Ações Rápidas</h3>
            </div>
            
            <div style={styles.navigationActions}>
              {isAnswered && (
                <button 
                  onClick={handleReset}
                  style={{...styles.actionButton, backgroundColor: '#6c757d'}}
                >
                  🔄 Tentar Novamente
                </button>
              )}
              
              <button 
                onClick={handleRandomQuestion}
                style={{...styles.actionButton, backgroundColor: '#667eea'}}
              >
                🎲 Questão Aleatória
              </button>
              
              <Link 
                to="/random-test"
                style={{...styles.actionLink, backgroundColor: '#28a745'}}
              >
                📝 Teste Aleatório
              </Link>
              
              <Link 
                to="/questions"
                style={{...styles.actionLink, backgroundColor: '#667eea'}}
              >
                📚 Banco de Questões
              </Link>

              <Link 
                to="/tests"
                style={{...styles.actionLink, backgroundColor: '#ffc107', color: '#212529'}}
              >
                📊 Todos os Testes
              </Link>
            </div>

            {/* Status da Questão */}
            {isAnswered && (
              <div style={styles.resultSection}>
                <h4 style={styles.resultTitle}>Resultado</h4>
                <div style={{
                  ...styles.resultBadge,
                  backgroundColor: selectedOption === question.correctOptionIndex ? '#d4edda' : '#f8d7da',
                  color: selectedOption === question.correctOptionIndex ? '#155724' : '#721c24'
                }}>
                  {selectedOption === question.correctOptionIndex ? '✓ Correto' : '✗ Incorreto'}
                </div>
                {selectedOption !== question.correctOptionIndex && (
                  <p style={styles.correctAnswerText}>
                    Resposta correta: <strong>{String.fromCharCode(65 + question.correctOptionIndex)}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Botão de Verificar Resposta */}
            {!isAnswered && (
              <div style={styles.verifySection}>
                <button 
                  onClick={handleCheckAnswer}
                  style={{
                    ...styles.verifyButton,
                    backgroundColor: selectedOption !== null ? '#28a745' : '#e9ecef',
                    color: selectedOption !== null ? 'white' : '#6c757d',
                    cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                    boxShadow: selectedOption !== null 
                      ? '0 6px 20px rgba(40, 167, 69, 0.4)' 
                      : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOption !== null) {
                      e.target.style.backgroundColor = '#218838';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOption !== null) {
                      e.target.style.backgroundColor = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                >
                  ✓ Verificar Resposta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de navegação inferior fixa */}
      <div style={styles.bottomNavigation}>
        <div style={styles.bottomNavContent}>
          <Link 
            to="/questions"
            style={styles.bottomNavButton}
          >
            ← Voltar ao Banco
          </Link>

          <div style={styles.bottomNavInfo}>
            <span style={styles.bottomNavText}>
              Questão Individual
            </span>
            <span style={styles.bottomNavSubtext}>
              {question.area || 'Área Geral'}
            </span>
          </div>

          <button
            onClick={handleRandomQuestion}
            style={{
              ...styles.bottomNavButton,
              backgroundColor: '#667eea',
              color: 'white'
            }}
          >
            Próxima Aleatória →
          </button>
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
              Material de Apoio
            </h3>
            <div style={styles.modalBody}>
              {question.attachments?.map((content, index) => 
                renderAttachmentContent(content, index)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Loading
const LoadingScreen = () => (
  <div style={styles.centerScreen}>
    <div style={styles.spinner}></div>
    <p style={styles.loadingText}>Carregando questão...</p>
  </div>
);

// Componente de Erro
const ErrorScreen = ({ error, onBack }) => (
  <div style={styles.centerScreen}>
    <div style={styles.errorIcon}>⚠️</div>
    <h3 style={styles.errorTitle}>Questão não encontrada</h3>
    <p style={styles.errorText}>{error || 'A questão solicitada não foi encontrada.'}</p>
    <button onClick={onBack} style={styles.retryButton}>
      ← Voltar ao Banco de Questões
    </button>
  </div>
);

// Estilos (baseados no ExecutarSimuladoPage)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '80px'
  },

  // Aviso de questão incompleta
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

  questionTitle: {
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
    fontSize: '1rem',
    fontWeight: '600',
    color: '#667eea',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  },

  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
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
    gap: '12px',
    marginBottom: '25px'
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
    lineHeight: '1.5',
    position: 'relative'
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
    flexShrink: 0,
    transition: 'all 0.3s ease'
  },

  optionText: {
    flex: 1,
    color: '#2d3748'
  },

  correctIcon: {
    color: '#28a745',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },

  incorrectIcon: {
    color: '#dc3545',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },

  explanationSection: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef'
  },

  explanationTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '10px'
  },

  explanationText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#4a5568',
    margin: 0
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

  navigationHeader: {
    marginBottom: '20px'
  },

  navigationTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },

  navigationActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '25px'
  },

  actionButton: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    color: 'white'
  },

  actionLink: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'left',
    color: 'white',
    transition: 'all 0.3s ease'
  },

  resultSection: {
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px'
  },

  resultTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px'
  },

  resultBadge: {
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '10px'
  },

  correctAnswerText: {
    fontSize: '0.85rem',
    color: '#6c757d',
    margin: 0
  },

  verifySection: {
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px',
    marginTop: '20px'
  },

  verifyButton: {
    width: '100%',
    padding: '16px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    letterSpacing: '0.5px'
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
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '140px',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block'
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
  }
};

// CSS para animações
const animationCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  /* Hover effects */
  button:hover {
    transform: translateY(-1px);
  }

  .action-button:hover, .action-link:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .attachment-button:hover {
    background-color: #218838 !important;
    transform: translateY(-1px);
  }

  /* Responsividade */
  @media (max-width: 1024px) {
    .content {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    
    .navigationSection {
      position: static !important;
    }
  }

  @media (max-width: 768px) {
    .headerContent {
      flex-direction: column !important;
      text-align: center !important;
    }
    
    .headerStats {
      justify-content: center !important;
      gap: 20px !important;
    }
    
    .content {
      padding: 20px 15px !important;
    }
    
    .questionCard {
      padding: 20px !important;
    }
    
    .bottomNavContent {
      padding: 0 15px !important;
      gap: 10px !important;
    }
    
    .bottomNavButton {
      min-width: 100px !important;
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
  const existingStyle = document.getElementById('single-question-page-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'single-question-page-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
  }
}

export default SingleQuestionPage;