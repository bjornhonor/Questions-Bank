// /frontend/src/components/QuestionCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function QuestionCard({ question }) {
  const [isHovered, setIsHovered] = useState(false);

  // Função para truncar texto longo
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Função para gerar cor baseada na área
  const getAreaColor = (area) => {
    const colors = {
      'Língua Portuguesa e Interpretação de Texto': '#e91e63',
      'Matemática': '#2196f3',
      'Conhecimentos Gerais': '#ff9800',
      'Noções Básicas de Informática': '#4caf50',
      'Noções de Administração Pública': '#9c27b0',
    };
    return colors[area] || '#6c757d';
  };

  const areaColor = getAreaColor(question.area);

  return (
    <Link 
      to={`/questions/${question._id}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? '0 12px 40px rgba(0,0,0,0.15)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* Header do Card */}
        <div style={styles.cardHeader}>
          <div 
            style={{
              ...styles.areaTag,
              backgroundColor: areaColor,
            }}
          >
            {question.area}
          </div>
          {question.attachments && question.attachments.length > 0 && (
            <div style={styles.attachmentIndicator}>
              <span style={styles.attachmentIcon}>📎</span>
              <span style={styles.attachmentText}>Texto de Apoio</span>
            </div>
          )}
        </div>

        {/* Tópico */}
        <div style={styles.topicSection}>
          <span style={styles.topicLabel}>Tópico:</span>
          <span style={styles.topicText}>{question.topic}</span>
        </div>

        {/* Questão */}
        <div style={styles.questionSection}>
          <p style={styles.questionText}>
            {truncateText(question.questionText)}
          </p>
        </div>

        {/* Footer do Card */}
        <div style={styles.cardFooter}>
          <div style={styles.optionsCount}>
            {question.options?.length || 5} alternativas
          </div>
          <div style={styles.viewButton}>
            Ver Questão →
          </div>
        </div>

        {/* Indicador de hover */}
        <div style={{
          ...styles.hoverIndicator,
          opacity: isHovered ? 1 : 0,
        }}></div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e9ecef',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px',
  },

  areaTag: {
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75em',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flex: '1',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },

  attachmentIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '12px',
    border: '1px solid #dee2e6',
  },

  attachmentIcon: {
    fontSize: '0.8em',
  },

  attachmentText: {
    fontSize: '0.7em',
    color: '#6c757d',
    fontWeight: '500',
  },

  topicSection: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '4px solid #1a73e8',
  },

  topicLabel: {
    fontSize: '0.8em',
    fontWeight: '600',
    color: '#495057',
    marginRight: '8px',
  },

  topicText: {
    fontSize: '0.9em',
    color: '#212529',
    lineHeight: '1.4',
  },

  questionSection: {
    flex: '1',
    marginBottom: '16px',
  },

  questionText: {
    fontSize: '1.05em',
    lineHeight: '1.6',
    color: '#212529',
    margin: 0,
    fontWeight: '400',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
  },

  optionsCount: {
    fontSize: '0.85em',
    color: '#6c757d',
    fontWeight: '500',
  },

  viewButton: {
    fontSize: '0.9em',
    color: '#1a73e8',
    fontWeight: '600',
    transition: 'color 0.3s ease',
  },

  hoverIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #1a73e8 0%, #667eea 100%)',
    transition: 'opacity 0.3s ease',
  },
};

export default QuestionCard;