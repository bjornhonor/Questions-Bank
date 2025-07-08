// /frontend/src/pages/RandomTestPage.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { colors, baseStyles } from '../styles';

// Estilos para o modal de anexos
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
  borderRadius: '12px',
  width: '70%',
  maxWidth: '800px',
  height: '80%',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
};

const closeButtonStyle = {
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
};

function RandomTestPage() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testState, setTestState] = useState('loading');
    const [finalResult, setFinalResult] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalQuestionIndex, setModalQuestionIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        const fetchQuestions = async () => {
            setTestState('loading');
            setErrorMessage('');
            try {
                const response = await axios.get('http://localhost:5000/api/questions/random-by-area?count=5');
                if (response.data && response.data.length > 0) {
                    setQuestions(response.data);
                    setTestState('in-progress');
                } else {
                    setErrorMessage('Nenhuma questão encontrada');
                    setTestState('error');
                }
            } catch (error) {
                console.error("Erro ao buscar questões:", error);
                setErrorMessage('Erro ao carregar questões. Tente novamente.');
                setTestState('error');
            }
        };
        fetchQuestions();
    }, []);

    const handleSelectOption = (questionId, optionIndex) => {
        if (testState === 'finished') return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmitTest = async () => {
        if (!userInfo || !userInfo.token) {
            alert('Você precisa estar logado para salvar seu resultado.');
            return;
        }

        // Verificar se todas as questões foram respondidas
        const unansweredQuestions = questions.filter(q => answers[q._id] === undefined);
        if (unansweredQuestions.length > 0) {
            alert(`Você precisa responder todas as ${questions.length} questões antes de finalizar.`);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const response = await axios.post(
                'http://localhost:5000/api/results/submit-random', 
                { answers, questions }, 
                config
            );

            setFinalResult(response.data);
            setTestState('finished');
            setCurrentQuestionIndex(0);
        } catch (error) {
            console.error("Erro ao submeter o teste:", error);
            setErrorMessage('Houve um erro ao finalizar o teste. Tente novamente.');
        }
    };

    const getButtonColor = (question, optionIndex) => {
        if (testState !== 'finished') return colors.cardBackground;
        const isCorrect = optionIndex === question.correctOptionIndex;
        const userWasSelected = answers[question._id] === optionIndex;

        if (isCorrect) return '#d4edda';
        if (userWasSelected && !isCorrect) return '#f8d7da';
        return colors.cardBackground;
    };

    const getButtonBorderColor = (question, optionIndex) => {
        if (testState !== 'finished') {
            return answers[question._id] === optionIndex ? colors.primary : colors.border;
        }
        const isCorrect = optionIndex === question.correctOptionIndex;
        const userWasSelected = answers[question._id] === optionIndex;

        if (isCorrect) return colors.success;
        if (userWasSelected && !isCorrect) return colors.error;
        return colors.border;
    };

    // Função para determinar o texto do botão baseado no tipo de conteúdo
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

    // Função para detectar se o conteúdo é uma imagem (baseada no SingleQuestionPage)
    const isImageUrl = (content) => {
        if (typeof content !== 'string') return false;
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
        const urlPattern = /^(https?:\/\/|\.\.?\/|\/)/;
        return urlPattern.test(content) && imageExtensions.test(content);
    };

    // Função para renderizar o conteúdo do anexo
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
                    fontSize: '14px',
                    color: '#333',
                    whiteSpace: 'pre-wrap'
                }}>
                    {content}
                </p>
            );
        }
    };

    if (testState === 'loading') {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                    display: 'inline-block', 
                    padding: '20px 40px', 
                    backgroundColor: colors.cardBackground,
                    borderRadius: baseStyles.borderRadius,
                    boxShadow: baseStyles.boxShadow 
                }}>
                    <h3 style={{ color: colors.primary, marginBottom: '10px' }}>🎲 Gerando Teste Aleatório</h3>
                    <p style={{ color: colors.textSecondary }}>Selecionando 5 questões de diferentes áreas...</p>
                </div>
            </div>
        );
    }

    if (testState === 'error' || questions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                    padding: '30px', 
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: baseStyles.borderRadius,
                    color: '#856404',
                    marginBottom: '20px'
                }}>
                    <h3>⚠️ Oops!</h3>
                    <p>{errorMessage || 'Não foi possível carregar as questões.'}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: baseStyles.transition
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                    onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                >
                    🔄 Tentar Novamente
                </button>
            </div>
        );
    }

    if (testState === 'finished' && finalResult) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: baseStyles.borderRadius,
                    boxShadow: baseStyles.boxShadow,
                    padding: '30px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: colors.primary, marginBottom: '20px' }}>🎉 Teste Finalizado!</h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            padding: '20px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>Pontuação</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                {finalResult.score}%
                            </p>
                        </div>
                        
                        <div style={{
                            padding: '20px',
                            backgroundColor: colors.success,
                            color: 'white',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>Acertos</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                {finalResult.correctAnswers}/{finalResult.totalQuestions}
                            </p>
                        </div>
                    </div>

                    {finalResult.performanceByArea && finalResult.performanceByArea.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: colors.primary, marginBottom: '15px' }}>📊 Performance por Área</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '15px'
                            }}>
                                {finalResult.performanceByArea.map((area, index) => (
                                    <div key={index} style={{
                                        padding: '15px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        textAlign: 'center'
                                    }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: colors.textPrimary }}>{area.area}</h4>
                                        <p style={{ margin: '0', color: colors.textSecondary }}>
                                            {area.correct}/{area.total} ({area.percentage}%)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: baseStyles.transition
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                    >
                        🎲 Novo Teste Aleatório
                    </button>
                </div>

                {/* Revisão das questões */}
                <div style={{
                    backgroundColor: colors.cardBackground,
                    borderRadius: baseStyles.borderRadius,
                    boxShadow: baseStyles.boxShadow,
                    padding: '20px'
                }}>
                    <h3 style={{ color: colors.primary, marginBottom: '20px' }}>📝 Revisão das Questões</h3>
                    {questions.map((question, index) => (
                        <div key={question._id} style={{
                            marginBottom: '25px',
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <span style={{
                                    backgroundColor: colors.primary,
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>
                                    Questão {index + 1}
                                </span>
                                <span style={{
                                    backgroundColor: question.area ? colors.secondary : colors.textSecondary,
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}>
                                    {question.area || 'Área não especificada'}
                                </span>
                            </div>

                            <h4 style={{ 
                                color: colors.textPrimary, 
                                marginBottom: '15px',
                                fontSize: '16px',
                                lineHeight: '1.5'
                            }}>
                                {question.questionText}
                            </h4>

                            {question.attachments && question.attachments.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <button
                                        onClick={() => {
                                            setModalQuestionIndex(index);
                                            setIsModalOpen(true);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#1e88e5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: baseStyles.transition,
                                            boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#1565c0';
                                            e.target.style.boxShadow = '0 3px 12px rgba(30, 136, 229, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = '#1e88e5';
                                            e.target.style.boxShadow = '0 2px 8px rgba(30, 136, 229, 0.3)';
                                        }}
                                    >
                                        📎 {getButtonText(question.attachments)}
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: '15px' }}>
                                {question.options.map((option, optionIndex) => (
                                    <button
                                        key={optionIndex}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            marginBottom: '8px',
                                            backgroundColor: getButtonColor(question, optionIndex),
                                            border: `2px solid ${getButtonBorderColor(question, optionIndex)}`,
                                            borderRadius: '8px',
                                            cursor: 'default',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: baseStyles.transition
                                        }}
                                    >
                                        {String.fromCharCode(65 + optionIndex)}) {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal de anexos */}
                {isModalOpen && (
                    <div style={modalOverlayStyle} onClick={() => {
                        setIsModalOpen(false);
                        setModalQuestionIndex(0);
                    }}>
                        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                            <button
                                style={closeButtonStyle}
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setModalQuestionIndex(0);
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#d32f2f';
                                    e.target.style.boxShadow = '0 3px 10px rgba(244, 67, 54, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#f44336';
                                    e.target.style.boxShadow = '0 2px 6px rgba(244, 67, 54, 0.3)';
                                }}
                            >
                                ✕
                            </button>
                            <h3 style={{ marginBottom: '20px' }}>📎 {getButtonText(questions[modalQuestionIndex]?.attachments)}</h3>
                            <div>
                                {questions[modalQuestionIndex]?.attachments?.map((attachment, index) => {
                                    const isImage = isImageUrl(attachment);
                                    const prevIsImage = index > 0 ? isImageUrl(questions[modalQuestionIndex].attachments[index - 1]) : false;
                                    const showSeparator = index > 0 && isImage !== prevIsImage;
                                    
                                    return (
                                        <div key={index}>
                                            {showSeparator && (
                                                <div style={{
                                                    height: '1px',
                                                    background: 'linear-gradient(to right, transparent, #ddd, transparent)',
                                                    margin: '25px 0'
                                                }} />
                                            )}
                                            {renderAttachmentContent(attachment, index)}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Instrução de uso */}
                            {questions[modalQuestionIndex]?.attachments?.some(isImageUrl) && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '12px 16px',
                                    backgroundColor: '#e3f2fd',
                                    border: '1px solid #1e88e5',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: '#1565c0'
                                }}>
                                    💡 <strong>Dica:</strong> As imagens são exibidas em tamanho otimizado.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Cabeçalho do teste */}
            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: baseStyles.borderRadius,
                boxShadow: baseStyles.boxShadow,
                padding: '20px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h2 style={{ color: colors.primary, margin: 0 }}>🎲 Teste Aleatório</h2>
                    <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
                        Questão {currentQuestionIndex + 1} de {questions.length}
                    </span>
                </div>
                
                {/* Barra de progresso */}
                <div style={{
                    backgroundColor: '#e0e0e0',
                    borderRadius: '10px',
                    height: '8px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        backgroundColor: colors.primary,
                        height: '100%',
                        width: `${progress}%`,
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            {/* Questão atual */}
            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: baseStyles.borderRadius,
                boxShadow: baseStyles.boxShadow,
                padding: '25px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <span style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '15px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        Questão {currentQuestionIndex + 1}
                    </span>
                    <span style={{
                        backgroundColor: colors.secondary,
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '15px',
                        fontSize: '12px'
                    }}>
                        {currentQuestion.area || 'Área não especificada'}
                    </span>
                </div>

                <h3 style={{ 
                    color: colors.textPrimary, 
                    marginBottom: '20px',
                    fontSize: '18px',
                    lineHeight: '1.6'
                }}>
                    {currentQuestion.questionText}
                </h3>

                {currentQuestion.attachments && currentQuestion.attachments.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={() => {
                                setModalQuestionIndex(currentQuestionIndex);
                                setIsModalOpen(true);
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#1e88e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                transition: baseStyles.transition,
                                boxShadow: '0 3px 10px rgba(30, 136, 229, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#1565c0';
                                e.target.style.boxShadow = '0 4px 15px rgba(30, 136, 229, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#1e88e5';
                                e.target.style.boxShadow = '0 3px 10px rgba(30, 136, 229, 0.3)';
                            }}
                        >
                            📎 {getButtonText(currentQuestion.attachments)}
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectOption(currentQuestion._id, index)}
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                marginBottom: '10px',
                                backgroundColor: answers[currentQuestion._id] === index ? colors.primary : colors.cardBackground,
                                color: answers[currentQuestion._id] === index ? 'white' : colors.textPrimary,
                                border: `2px solid ${answers[currentQuestion._id] === index ? colors.primary : colors.border}`,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                textAlign: 'left',
                                transition: baseStyles.transition,
                                boxShadow: answers[currentQuestion._id] === index ? '0 4px 12px rgba(64, 123, 255, 0.3)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (answers[currentQuestion._id] !== index) {
                                    e.target.style.backgroundColor = '#f0f0f0';
                                    e.target.style.borderColor = colors.primary;
                                }
                            }}
                            onMouseOut={(e) => {
                                if (answers[currentQuestion._id] !== index) {
                                    e.target.style.backgroundColor = colors.cardBackground;
                                    e.target.style.borderColor = colors.border;
                                }
                            }}
                        >
                            {String.fromCharCode(65 + index)}) {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navegação */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '30px'
            }}>
                <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: currentQuestionIndex === 0 ? colors.disabled : colors.textSecondary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: baseStyles.transition,
                        minWidth: '100px'
                    }}
                >
                    ← Anterior
                </button>

                <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: index === currentQuestionIndex ? colors.primary : 
                                               answers[questions[index]._id] !== undefined ? colors.success : colors.border,
                                transition: baseStyles.transition
                            }}
                        />
                    ))}
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: baseStyles.transition,
                            minWidth: '100px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                    >
                        {currentQuestionIndex === questions.length - 2 ? 'Próxima' : 'Avançar'} →
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmitTest}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: colors.success,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: baseStyles.transition,
                            minWidth: '140px',
                            boxShadow: '0 4px 12px rgba(52, 168, 83, 0.3)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2d7c3e'}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.success}
                    >
                        🏁 Finalizar Teste
                    </button>
                )}
            </div>

            {/* Modal de anexos */}
            {isModalOpen && (
                <div style={modalOverlayStyle} onClick={() => {
                    setIsModalOpen(false);
                    setModalQuestionIndex(0);
                }}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                            style={closeButtonStyle}
                            onClick={() => {
                                setIsModalOpen(false);
                                setModalQuestionIndex(0);
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#d32f2f';
                                e.target.style.boxShadow = '0 3px 10px rgba(244, 67, 54, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#f44336';
                                e.target.style.boxShadow = '0 2px 6px rgba(244, 67, 54, 0.3)';
                            }}
                        >
                            ✕
                        </button>
                        <h3 style={{ marginBottom: '20px' }}>📎 {getButtonText(questions[modalQuestionIndex]?.attachments)}</h3>
                        <div>
                            {questions[modalQuestionIndex]?.attachments?.map((attachment, index) => {
                                const isImage = isImageUrl(attachment);
                                const prevIsImage = index > 0 ? isImageUrl(questions[modalQuestionIndex].attachments[index - 1]) : false;
                                const showSeparator = index > 0 && isImage !== prevIsImage;
                                
                                return (
                                    <div key={index}>
                                        {showSeparator && (
                                            <div style={{
                                                height: '1px',
                                                background: 'linear-gradient(to right, transparent, #ddd, transparent)',
                                                margin: '25px 0'
                                            }} />
                                        )}
                                        {renderAttachmentContent(attachment, index)}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Instrução de uso */}
                        {questions[modalQuestionIndex]?.attachments?.some(isImageUrl) && (
                            <div style={{
                                marginTop: '20px',
                                padding: '12px 16px',
                                backgroundColor: '#e3f2fd',
                                border: '1px solid #1e88e5',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#1565c0'
                            }}>
                                💡 <strong>Dica:</strong> As imagens são exibidas em tamanho otimizado.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RandomTestPage;