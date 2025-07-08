// /frontend/src/pages/RedacaoPage.jsx
import { useNavigate } from 'react-router-dom';

function RedacaoPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Redação</h1>
          <p style={styles.subtitle}>
            Desenvolva suas habilidades de escrita com temas atuais e relevantes
          </p>
        </div>
        
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>✍️</div>
            <div style={styles.statLabel}>Escrita</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>🚧</div>
            <div style={styles.statLabel}>Em Breve</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>📝</div>
            <div style={styles.statLabel}>Correção</div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={styles.content}>
        <div style={styles.comingSoonCard}>
          <div style={styles.comingSoonIcon}>📚</div>
          <h2 style={styles.comingSoonTitle}>Módulo de Redação em Desenvolvimento</h2>
          <p style={styles.comingSoonText}>
            Estamos criando uma experiência completa para aprimorar suas habilidades de redação. 
            Em breve, você terá acesso a temas atuais, correção automática e dicas personalizadas.
          </p>
          
          <div style={styles.featuresPreview}>
            <h3 style={styles.featuresTitle}>O que estará disponível:</h3>
            <div style={styles.featuresList}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📰</span>
                <span>Temas atuais e relevantes</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🤖</span>
                <span>Correção automática inteligente</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>💡</span>
                <span>Dicas personalizadas de melhoria</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📊</span>
                <span>Análise de estrutura e coesão</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🎯</span>
                <span>Diferentes tipos de redação</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📈</span>
                <span>Acompanhamento de progresso</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🏆</span>
                <span>Banco de redações modelo</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>⏱️</span>
                <span>Cronômetro para prática</span>
              </div>
            </div>
          </div>

          <div style={styles.tipBox}>
            <h4 style={styles.tipTitle}>💡 Dica Enquanto Aguarda:</h4>
            <p style={styles.tipText}>
              Pratique lendo editoriais de jornais, identifique a estrutura argumentativa 
              e tente reescrevê-los com suas próprias palavras. Isso ajudará a desenvolver 
              seu estilo de escrita e repertório cultural.
            </p>
          </div>

          <button 
            style={styles.backButton}
            onClick={() => navigate('/tests')}
          >
            ← Voltar para Testes
          </button>
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
    background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
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

  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },

  comingSoonCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px',
    border: '1px solid #e9ecef',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '700px',
    width: '100%',
  },

  comingSoonIcon: {
    fontSize: '4em',
    marginBottom: '20px',
  },

  comingSoonTitle: {
    fontSize: '1.8em',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '20px',
  },

  comingSoonText: {
    fontSize: '1.1em',
    color: '#6c757d',
    lineHeight: '1.6',
    marginBottom: '30px',
  },

  featuresPreview: {
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
  },

  featuresTitle: {
    fontSize: '1.3em',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '20px',
    textAlign: 'center',
  },

  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95em',
    color: '#495057',
  },

  featureIcon: {
    fontSize: '1.2em',
    minWidth: '25px',
  },

  tipBox: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    textAlign: 'left',
  },

  tipTitle: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#856404',
    marginBottom: '10px',
  },

  tipText: {
    fontSize: '1em',
    color: '#856404',
    lineHeight: '1.6',
    margin: '0',
  },

  backButton: {
    padding: '15px 30px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default RedacaoPage;