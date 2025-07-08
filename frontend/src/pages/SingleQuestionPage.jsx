// /frontend/src/pages/SingleQuestionPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// import '../styles/ImageModal.css'; // Descomente se usar o arquivo CSS separado

// --- Estilos para o Modal ---
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
  width: '85%',
  maxWidth: '900px',
  maxHeight: '85vh',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  padding: '8px 12px',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#6c757d',
  transition: 'all 0.2s ease'
};

const attachmentImageStyle = {
  maxWidth: '100%',
  height: 'auto',
  margin: '15px 0',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  display: 'block'
};

const attachmentTextStyle = {
  marginBottom: '15px',
  lineHeight: '1.6',
  fontSize: '16px',
  color: '#333'
};

function SingleQuestionPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // Para controle de zoom

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

  // Função para detectar se o conteúdo é uma imagem
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
        <div key={index} className="image-container" style={{ textAlign: 'center', margin: '20px 0' }}>
          <img 
            src={content} 
            alt={`Material de apoio ${index + 1}`}
            style={{
              ...attachmentImageStyle,
              cursor: 'zoom-in',
              transform: zoomedImage === index ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.3s ease',
              zIndex: zoomedImage === index ? 100 : 1,
              position: 'relative'
            }}
            onClick={() => setZoomedImage(zoomedImage === index ? null : index)}
            onError={(e) => {
              // Se a imagem falhar ao carregar, substitui por uma mensagem de erro
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
            onLoad={(e) => {
              // Adiciona tooltip quando a imagem carrega
              if (!e.target.title) {
                e.target.title = 'Clique para ampliar/reduzir';
              }
            }}
          />
        </div>
      );
    } else {
      return (
        <p key={index} style={attachmentTextStyle}>
          {content}
        </p>
      );
    }
  };

  // Função para determinar o texto do botão baseado no tipo de conteúdo
  const getButtonText = () => {
    if (!question.attachments || question.attachments.length === 0) {
      return 'Ver Material de Apoio';
    }

    const hasImages = question.attachments.some(isImageUrl);
    const hasText = question.attachments.some(content => !isImageUrl(content));

    if (hasImages && hasText) {
      return 'Ver Material de Apoio';
    } else if (hasImages) {
      return 'Ver Imagens';
    } else {
      return 'Ver Texto de Apoio';
    }
  };

  if (loading) return <p>Carregando questão...</p>;
  if (!question) return <p>Questão não encontrada.</p>;

  const hasAttachments = question.attachments && question.attachments.length > 0;

  return (
    <div>
      {/* Modal com conteúdo misto */}
      {isModalOpen && (
        <div 
          style={modalOverlayStyle} 
          onClick={(e) => {
            // Se clicou no overlay (fora do modal), fecha o modal
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setZoomedImage(null); // Reset zoom ao fechar modal
            }
          }}
        >
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setZoomedImage(null); // Reset zoom ao fechar modal
              }} 
              style={closeButtonStyle}
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
            
            <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>
              Material de Apoio
            </h3>
            
            <div>
              {question.attachments.map((content, index) => {
                // Adiciona separador visual entre diferentes tipos de conteúdo
                const isImage = isImageUrl(content);
                const prevIsImage = index > 0 ? isImageUrl(question.attachments[index - 1]) : false;
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
                    {renderAttachmentContent(content, index)}
                  </div>
                );
              })}
            </div>
            
            {/* Instrução de uso para imagens */}
            {question.attachments.some(isImageUrl) && (
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                backgroundColor: '#e7f3ff',
                border: '1px solid #b3d9ff',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#0066cc'
              }}>
                💡 <strong>Dica:</strong> Clique nas imagens para ampliar ou reduzir.
              </div>
            )}
          </div>
        </div>
      )}

      <Link to="/questions" style={{ 
        textDecoration: 'none', 
        marginBottom: '20px', 
        display: 'inline-block',
        color: '#007bff',
        fontSize: '16px'
      }}>
        ← Voltar para o Banco de Questões
      </Link>

      {/* Botão para abrir o modal */}
      {hasAttachments && (
        <button 
          onClick={() => setIsModalOpen(true)} 
          style={{ 
            marginLeft: '20px',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {getButtonText()}
        </button>
      )}

      <h3 style={{ marginTop: '20px', color: '#6c757d', fontSize: '18px' }}>
        {question.area} - {question.topic}
      </h3>
      
      <p style={{ fontSize: '20px', lineHeight: '1.6', margin: '20px 0' }}>
        {question.questionText}
      </p>

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
              margin: '8px 0',
              padding: '15px',
              backgroundColor: getButtonColor(index),
              border: selectedOption === index ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              cursor: isAnswered ? 'default' : 'pointer',
              fontSize: '16px',
              lineHeight: '1.4',
              transition: 'all 0.2s ease',
              boxShadow: selectedOption === index ? '0 2px 8px rgba(0,123,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isAnswered) {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAnswered) {
                e.target.style.backgroundColor = getButtonColor(index);
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <button 
        onClick={handleCheckAnswer} 
        disabled={isAnswered || selectedOption === null} 
        style={{ 
          marginTop: '30px', 
          padding: '12px 30px',
          backgroundColor: isAnswered || selectedOption === null ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isAnswered || selectedOption === null ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isAnswered && selectedOption !== null) {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAnswered && selectedOption !== null) {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        Corrigir
      </button>

      {isAnswered && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          {selectedOption === question.correctOptionIndex ? 
            <h2 style={{ color: '#28a745', margin: 0 }}>✓ Correto!</h2> : 
            <h2 style={{ color: '#dc3545', margin: 0 }}>✗ Incorreto!</h2>
          }
        </div>
      )}
    </div>
  );
}

export default SingleQuestionPage;