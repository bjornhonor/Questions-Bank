// /frontend/src/pages/RandomTestPage.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { colors, baseStyles } from '../styles';

// Estilos para o modal de anexos (similar ao SingleQuestionPage)
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
  backgroundColor: '#f5f5f5',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 'bold',
};

function RandomTestPage() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testState, setTestState] = useState('loading');
    const [finalResult, setFinalResult] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        const fetchQuestions = async () => {
            setTestState('loading');
            try {
                const response = await axios.get('http://localhost:5000/api/questions/random-by-area?count=5');
                setQuestions(response.data);
                setTestState('in-progress');
            } catch (error) {
                console.error("Erro ao buscar questões:", error);
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
            alert('Houve um erro ao finalizar o teste.');
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
                    color: '#856404'
                }}>
                    <h3>⚠️ Oops!</h3>
                    <p>Não foi possível carregar as questões. Tente novamente mais tarde.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '15px'
                        }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const hasAttachments = currentQuestion.attachments && currentQuestion.attachments.length > 0;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {/* Modal para anexos */}
            {isModalOpen && hasAttachments && (
                <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}>✕</button>
                        <h3 style={{ color: colors.primaryDark, marginBottom: '20px' }}>📄 Texto de Apoio</h3>
                        <div style={{ lineHeight: '1.6', color: colors.text }}>
                            {currentQuestion.attachments.map((paragraph, index) => (
                                <p key={index} style={{ marginBottom: '15px' }}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header do teste */}
            <div style={{
                backgroundColor: colors.cardBackground,
                padding: '25px',
                borderRadius: baseStyles.borderRadius,
                boxShadow: baseStyles.boxShadow,
                marginBottom: '25px',
                border: `1px solid ${colors.border}`
            }}>
                {testState === 'finished' ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px', marginRight: '10px' }}>🎉</span>
                            <h2 style={{ color: colors.primaryDark, margin: 0 }}>Resultado do Teste Aleatório</h2>
                        </div>
                        
                        {finalResult && (
                            <div style={{ 
                                backgroundColor: colors.background, 
                                padding: '20px', 
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ 
                                    fontSize: '20px', 
                                    fontWeight: 'bold', 
                                    color: finalResult.overallScore >= 0.7 ? colors.success : finalResult.overallScore >= 0.5 ? '#e67e22' : colors.error,
                                    marginBottom: '15px'
                                }}>
                                    📊 Pontuação Geral: {Math.round(finalResult.overallScore * 100)}% 
                                    ({finalResult.correctAnswers} de {questions.length} acertos)
                                </div>
                                
                                <div style={{ marginTop: '15px' }}>
                                    <h4 style={{ color: colors.primaryDark, marginBottom: '10px' }}>📈 Desempenho por Área:</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                                        {Object.entries(finalResult.areaScores).map(([area, score]) => (
                                            <div key={area} style={{
                                                padding: '12px 15px',
                                                backgroundColor: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #e0e0e0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontSize: '14px', color: colors.text }}>{area}</span>
                                                <span style={{ 
                                                    fontWeight: 'bold', 
                                                    color: score >= 70 ? colors.success : score >= 50 ? '#e67e22' : colors.error 
                                                }}>
                                                    {score}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <h4 style={{ color: colors.primaryDark }}>🔍 Revisão da Questão {currentQuestionIndex + 1}:</h4>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <h2 style={{ color: colors.primaryDark, margin: 0 }}>
                                🎯 Teste Aleatório
                            </h2>
                            <span style={{ 
                                color: colors.textSecondary, 
                                fontSize: '16px',
                                backgroundColor: colors.background,
                                padding: '6px 12px',
                                borderRadius: '20px'
                            }}>
                                Questão {currentQuestionIndex + 1} de {questions.length}
                            </span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: colors.background,
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: colors.primary,
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Card da questão */}
            <div style={{
                backgroundColor: colors.cardBackground,
                padding: '30px',
                borderRadius: baseStyles.borderRadius,
                boxShadow: baseStyles.boxShadow,
                marginBottom: '25px',
                border: `1px solid ${colors.border}`
            }}>
                {/* Cabeçalho da questão */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{
                        backgroundColor: colors.background,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: colors.primaryDark,
                        fontSize: '14px',
                        fontWeight: '500',
                        flex: 1,
                        minWidth: '200px'
                    }}>
                        📚 {currentQuestion.area} - {currentQuestion.topic}
                    </div>
                    
                    {hasAttachments && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                backgroundColor: colors.primary,
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: baseStyles.transition
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                            onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                        >
                            📄 Ver Texto de Apoio
                        </button>
                    )}
                </div>

                {/* Pergunta */}
                <p style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    color: colors.text,
                    marginBottom: '25px',
                    fontWeight: '500'
                }}>
                    {currentQuestion.questionText}
                </p>

                {/* Opções */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentQuestion.options.map((option, index) => (
                        <label 
                            key={index} 
                            style={{ 
                                backgroundColor: getButtonColor(currentQuestion, index),
                                padding: '16px 20px',
                                borderRadius: '10px',
                                border: `2px solid ${getButtonBorderColor(currentQuestion, index)}`,
                                cursor: testState === 'finished' ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                transition: baseStyles.transition,
                                fontSize: '16px',
                                lineHeight: '1.5'
                            }}
                            onMouseOver={(e) => {
                                if (testState !== 'finished') {
                                    e.target.style.backgroundColor = colors.background;
                                }
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = getButtonColor(currentQuestion, index);
                            }}
                        >
                            <input 
                                type="radio" 
                                name={currentQuestion._id}
                                checked={answers[currentQuestion._id] === index}
                                disabled={testState === 'finished'}
                                onChange={() => handleSelectOption(currentQuestion._id, index)}
                                style={{ 
                                    width: '18px', 
                                    height: '18px', 
                                    marginTop: '2px',
                                    accentColor: colors.primary
                                }}
                            />
                            <span style={{ flex: 1, color: colors.text }}>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Botões de navegação */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap'
            }}>
                <button 
                    onClick={() => setCurrentQuestionIndex(p => p - 1)} 
                    disabled={currentQuestionIndex === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: currentQuestionIndex === 0 ? colors.background : colors.cardBackground,
                        color: currentQuestionIndex === 0 ? colors.textSecondary : colors.primaryDark,
                        border: `2px solid ${currentQuestionIndex === 0 ? colors.border : colors.primary}`,
                        borderRadius: '8px',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        transition: baseStyles.transition,
                        minWidth: '140px'
                    }}
                >
                    ← {testState === 'finished' ? 'Anterior' : 'Voltar'}
                </button>

                {testState === 'in-progress' && (
                    <div style={{ 
                        textAlign: 'center',
                        color: colors.textSecondary,
                        fontSize: '14px'
                    }}>
                        {Object.keys(answers).length} de {questions.length} respondidas
                    </div>
                )}

                {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                        onClick={() => setCurrentQuestionIndex(p => p + 1)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            transition: baseStyles.transition,
                            minWidth: '140px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = colors.primaryDark}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                    >
                        {testState === 'finished' ? 'Próxima' : 'Avançar'} →
                    </button>
                ) : (
                    testState === 'in-progress' && (
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
                    )
                )}
            </div>

            {/* Botão para novo teste (apenas quando finalizado) */}
            {testState === 'finished' && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
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
            )}
        </div>
    );
}

export default RandomTestPage;