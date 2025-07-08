// /frontend/src/pages/RandomTestPage.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Importa o contexto de autenticação

function RandomTestPage() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testState, setTestState] = useState('loading'); // loading, in-progress, finished, error
    const [finalResult, setFinalResult] = useState(null);

    // Pega as informações do usuário logado do nosso contexto global
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
    }, []); // O array vazio [] garante que isso rode apenas uma vez quando a página carrega

    const handleSelectOption = (questionId, optionIndex) => {
        if (testState === 'finished') return; // Impede a troca de resposta após finalizar
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmitTest = async () => {
        if (!userInfo || !userInfo.token) {
            alert('Você precisa estar logado para salvar seu resultado.');
            return;
        }

        try {
            // Configuração do cabeçalho da requisição com o token de autorização
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            // Envia as respostas junto com a configuração do cabeçalho
            const response = await axios.post(
                'http://localhost:5000/api/results/submit', 
                { answers }, 
                config
            );

            setFinalResult(response.data);
            setTestState('finished');
            setCurrentQuestionIndex(0); // Volta para a primeira questão para o modo de revisão
        } catch (error) {
            console.error("Erro ao submeter o teste:", error);
            alert('Houve um erro ao finalizar o teste.');
        }
    };

    const getButtonColor = (question, optionIndex) => {
        if (testState !== 'finished') return 'transparent';
        const isCorrect = optionIndex === question.correctOptionIndex;
        const userWasSelected = answers[question._id] === optionIndex;

        if (isCorrect) return 'lightgreen';
        if (userWasSelected && !isCorrect) return 'salmon';
        return 'transparent';
    };

    if (testState === 'loading') return <p>Gerando seu teste aleatório...</p>;
    if (testState === 'error' || questions.length === 0) return <p>Não foi possível carregar as questões. Tente novamente mais tarde.</p>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div>
            {/* --- MODO DE REVISÃO PÓS-TESTE --- */}
            {testState === 'finished' ? (
                 <div>
                    <h2 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Resultado do Teste</h2>
                    <p style={{fontSize: '1.2em'}}>
                        <strong>
                            Pontuação Final: {Math.round(finalResult.score * 100)}% 
                            ({Math.round(finalResult.score * questions.length)} de {questions.length} acertos)
                        </strong>
                    </p>
                    <hr />
                    <h4>Revisão da Questão {currentQuestionIndex + 1}:</h4>
                 </div>
            ) : (
            /* --- MODO DE TESTE EM ANDAMENTO --- */
                 <h2>Teste Aleatório: Questão {currentQuestionIndex + 1} de {questions.length}</h2>
            )}

            {/* --- COMPONENTE DA QUESTÃO (USADO NOS DOIS MODOS) --- */}
            <p><strong>{currentQuestion.area} - {currentQuestion.topic}</strong></p>
            <p style={{fontSize: '1.1em'}}>{currentQuestion.questionText}</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {currentQuestion.options.map((option, index) => (
                    <label 
                        key={index} 
                        style={{ 
                            backgroundColor: getButtonColor(currentQuestion, index), 
                            padding: '10px', margin: '5px 0', borderRadius: '5px',
                            border: '1px solid #ccc', cursor: testState === 'finished' ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}
                    >
                        <input type="radio" name={currentQuestion._id}
                            checked={answers[currentQuestion._id] === index}
                            disabled={testState === 'finished'}
                            onChange={() => handleSelectOption(currentQuestion._id, index)} />
                        <span style={{ marginLeft: '10px' }}>{option}</span>
                    </label>
                ))}
            </div>

            {/* --- BOTÕES DE NAVEGAÇÃO --- */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>
                    &larr; {testState === 'finished' ? 'Revisão Anterior' : 'Anterior'}
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                        {testState === 'finished' ? 'Próxima Revisão' : 'Próxima'} &rarr;
                    </button>
                ) : (
                    testState === 'in-progress' && (
                        <button onClick={handleSubmitTest} style={{ backgroundColor: '#28a745', color: 'white' }}>
                            Finalizar Teste
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

export default RandomTestPage;