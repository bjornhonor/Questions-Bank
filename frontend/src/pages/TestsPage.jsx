// /frontend/src/pages/TestsPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function TestsPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const testCards = [
    {
      id: 'random-test',
      title: 'Teste Aleatório',
      description: 'Resolva 5 questões aleatórias de diferentes áreas para testar seus conhecimentos',
      icon: '🎲',
      color: '#1a73e8',
      gradient: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
      route: '/random-test',
      features: ['5 questões aleatórias', 'Diferentes áreas', 'Resultado imediato']
    },
    {
      id: 'simulados',
      title: 'Simulados',
      description: 'Pratique com simulados completos baseados em provas reais de concursos',
      icon: '📝',
      color: '#34a853',
      gradient: 'linear-gradient(135deg, #34a853 0%, #4caf50 100%)',
      route: '/simulados',
      features: ['Provas completas', 'Tempo cronometrado', 'Ranking de desempenho']
    },
    {
      id: 'redacao',
      title: 'Redação',
      description: 'Desenvolva suas habilidades de escrita com temas atuais e relevantes',
      icon: '✍️',
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
      route: '/redacao',
      features: ['Temas atuais', 'Correção automática', 'Dicas de escrita']
    }
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Seção de Testes</h1>
          <p style={styles.subtitle}>
            Escolha o tipo de teste que deseja realizar para aprimorar seus conhecimentos
          </p>
        </div>
        
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>3</div>
            <div style={styles.statLabel}>Modalidades</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>∞</div>
            <div style={styles.statLabel}>Possibilidades</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>100%</div>
            <div style={styles.statLabel}>Aprendizado</div>
          </div>
        </div>
      </div>

      {/* Cards de Testes */}
      <div style={styles.cardsContainer}>
        {testCards.map((card) => (
          <div
            key={card.id}
            style={{
              ...styles.card,
              transform: hoveredCard === card.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredCard === card.id 
                ? '0 20px 40px rgba(0,0,0,0.15)' 
                : '0 8px 25px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(card.route)}
          >
            {/* Indicador de hover */}
            <div style={{
              ...styles.hoverIndicator,
              background: card.gradient,
              opacity: hoveredCard === card.id ? 1 : 0,
            }}></div>

            {/* Conteúdo do Card */}
            <div style={styles.cardContent}>
              {/* Ícone */}
              <div style={{
                ...styles.cardIcon,
                background: card.gradient,
              }}>
                <span style={styles.iconText}>{card.icon}</span>
              </div>

              {/* Título e Descrição */}
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDescription}>{card.description}</p>
              </div>

              {/* Features */}
              <div style={styles.featuresContainer}>
                {card.features.map((feature, index) => (
                  <div key={index} style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span style={styles.featureText}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Botão */}
              <div style={styles.cardFooter}>
                <button style={{
                  ...styles.cardButton,
                  background: hoveredCard === card.id ? card.gradient : 'transparent',
                  color: hoveredCard === card.id ? 'white' : card.color,
                  border: `2px solid ${card.color}`,
                }}>
                  {card.id === 'random-test' ? 'Iniciar Teste' : 
                   card.id === 'simulados' ? 'Ver Simulados' : 'Abrir Redação'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Estatísticas */}
      <div style={styles.infoSection}>
        <h2 style={styles.infoTitle}>Por que fazer testes?</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🎯</div>
            <h4 style={styles.infoCardTitle}>Identificar Pontos Fracos</h4>
            <p style={styles.infoCardText}>
              Descubra quais áreas precisam de mais atenção e foque seus estudos de forma eficiente
            </p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>📊</div>
            <h4 style={styles.infoCardTitle}>Acompanhar Progresso</h4>
            <p style={styles.infoCardText}>
              Monitore sua evolução ao longo do tempo e veja como está se saindo em cada área
            </p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🏆</div>
            <h4 style={styles.infoCardTitle}>Preparação Real</h4>
            <p style={styles.infoCardText}>
              Simule condições reais de prova e ganhe confiança para o dia da avaliação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    animation: 'fadeIn 0.6s ease-out',
  },

  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '40px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },

  titleSection: {
    marginBottom: '30px',
  },

  title: {
    fontSize: '2.5em',
    fontWeight: '700',
    margin: '0 0 15px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '1.1em',
    opacity: '0.9',
    margin: '0',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.5',
  },

  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },

  statCard: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    minWidth: '120px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s ease',
  },

  statNumber: {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },

  statLabel: {
    fontSize: '0.9em',
    opacity: '0.9',
  },

  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginBottom: '50px',
  },

  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '0',
    border: '1px solid #e9ecef',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '400px',
  },

  hoverIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    transition: 'opacity 0.3s ease',
  },

  cardContent: {
    padding: '30px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  cardIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },

  iconText: {
    fontSize: '2em',
  },

  cardHeader: {
    marginBottom: '20px',
  },

  cardTitle: {
    fontSize: '1.5em',
    fontWeight: '700',
    color: '#212529',
    margin: '0 0 10px 0',
  },

  cardDescription: {
    fontSize: '1em',
    color: '#6c757d',
    lineHeight: '1.6',
    margin: '0',
  },

  featuresContainer: {
    flex: '1',
    marginBottom: '25px',
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },

  featureIcon: {
    color: '#34a853',
    fontWeight: 'bold',
    fontSize: '1.1em',
  },

  featureText: {
    fontSize: '0.9em',
    color: '#495057',
  },

  cardFooter: {
    marginTop: 'auto',
  },

  cardButton: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  infoSection: {
    marginTop: '60px',
    textAlign: 'center',
  },

  infoTitle: {
    fontSize: '2em',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '40px',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },

  infoCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid #e9ecef',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease',
    textAlign: 'center',
  },

  infoIcon: {
    fontSize: '3em',
    marginBottom: '20px',
  },

  infoCardTitle: {
    fontSize: '1.3em',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '15px',
  },

  infoCardText: {
    fontSize: '1em',
    color: '#6c757d',
    lineHeight: '1.6',
    margin: '0',
  },
};

export default TestsPage;