// /frontend/src/pages/HomePage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

function HomePage() {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAreas: 0,
    totalTopics: 0
  });
  const [loading, setLoading] = useState(true);

  // Buscar estatísticas da API otimizada
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats');
        const statsData = response.data;
        
        setStats({
          totalQuestions: statsData.questions.total,
          totalAreas: statsData.questions.areas,
          totalTopics: statsData.questions.topics
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Fallback para API de questões se a API de stats não estiver disponível
        try {
          const fallbackResponse = await axios.get('http://localhost:5000/api/questions');
          const questions = fallbackResponse.data;
          
          const uniqueAreas = [...new Set(questions.map(q => q.area))];
          const uniqueTopics = [...new Set(questions.map(q => q.topic))];
          
          setStats({
            totalQuestions: questions.length,
            totalAreas: uniqueAreas.length,
            totalTopics: uniqueTopics.length
          });
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
          // Valores padrão em caso de erro total
          setStats({
            totalQuestions: 110,
            totalAreas: 5,
            totalTopics: 49
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Função para determinar a saudação personalizada
  const getGreeting = () => {
    if (!userInfo) return 'Bem-vindo(a)';
    
    const email = userInfo.email?.toLowerCase() || '';
    if (email.includes('gabrielle')) {
      return 'Bem-vinda, meu amor ❤️';
    }
    
    return `Olá, ${userInfo.name || 'Usuário'}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    
    // Hero Section
    heroSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '80px 20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroContent: {
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '700',
      marginBottom: '20px',
      lineHeight: '1.2',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    heroSubtitle: {
      fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
      marginBottom: '40px',
      opacity: '0.95',
      lineHeight: '1.6',
      fontWeight: '300'
    },
    heroGreeting: {
      fontSize: '1.2rem',
      marginBottom: '30px',
      opacity: '0.9',
      fontWeight: '500'
    },
    heroCTA: {
      display: 'inline-block',
      padding: '15px 35px',
      fontSize: '1.1rem',
      fontWeight: '600',
      backgroundColor: '#ff6b6b',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '50px',
      boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer'
    },
    
    // Tools Section
    toolsSection: {
      padding: '80px 20px',
      backgroundColor: 'white'
    },
    sectionContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '50px',
      color: '#2c3e50',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    toolsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginTop: '40px'
    },
    toolCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px 30px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      border: '1px solid #f0f0f0',
      position: 'relative',
      overflow: 'hidden'
    },
    toolIcon: {
      fontSize: '3rem',
      marginBottom: '20px',
      display: 'block'
    },
    toolTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    toolDescription: {
      fontSize: '1rem',
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '25px'
    },
    toolButton: {
      display: 'inline-block',
      padding: '12px 25px',
      backgroundColor: '#667eea',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '25px',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    
    // Stats Section
    statsSection: {
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '30px',
      marginTop: '40px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px 20px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '1rem',
      color: '#666',
      fontWeight: '500'
    },
    
    // CTA Final Section
    ctaSection: {
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '30px'
    },
    ctaButton: {
      display: 'inline-block',
      padding: '18px 40px',
      fontSize: '1.2rem',
      fontWeight: '600',
      backgroundColor: 'white',
      color: '#667eea',
      textDecoration: 'none',
      borderRadius: '50px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer'
    },
    
    // Loading
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60px',
      fontSize: '1.1rem',
      color: '#666'
    },

    // Responsividade adicional
    '@media (max-width: 768px)': {
      toolsGrid: {
        gridTemplateColumns: '1fr',
        gap: '20px'
      },
      statsGrid: {
        gridTemplateColumns: '1fr',
        gap: '20px'
      },
      heroSection: {
        padding: '60px 20px'
      },
      toolsSection: {
        padding: '60px 20px'
      },
      statsSection: {
        padding: '60px 20px'
      },
      ctaSection: {
        padding: '60px 20px'
      }
    }
  };

  const tools = [
    {
      icon: '📚',
      title: 'Banco de Questões',
      description: 'Filtre por área e tópico, pratique com questões de provas anteriores e reforce seu conhecimento.',
      link: '/questions',
      buttonText: 'Explorar Questões'
    },
    {
      icon: '⏱️',
      title: 'Simulados',
      description: 'Resolva provas no formato real do concurso, com tempo cronometrado e gabarito detalhado.',
      link: '/simulados',
      buttonText: 'Ver Simulados'
    },
    {
      icon: '✍️',
      title: 'Testes Personalizados',
      description: 'Crie testes personalizados com o número de questões que você quiser para focar nos seus estudos.',
      link: '/tests',
      buttonText: 'Criar Teste'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          {userInfo && (
            <p style={styles.heroGreeting}>
              {getGreeting()}
            </p>
          )}
          <h1 style={styles.heroTitle}>
            Sua aprovação no concurso de Bombeiro SP começa aqui
          </h1>
          <p style={styles.heroSubtitle}>
            A plataforma completa com milhares de questões, simulados realistas e todo o conteúdo que você precisa para conquistar sua vaga.
          </p>
          {userInfo ? (
            <Link 
              to="/dashboard" 
              style={styles.heroCTA}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
              }}
            >
              Acessar Meu Painel →
            </Link>
          ) : (
            <Link 
              to="/register" 
              style={styles.heroCTA}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
              }}
            >
              Iniciar Meus Estudos →
            </Link>
          )}
        </div>
      </section>

      {/* Tools Section */}
      <section style={styles.toolsSection}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Escolha por onde começar</h2>
          <div style={styles.toolsGrid}>
            {tools.map((tool, index) => (
              <div 
                key={index} 
                style={styles.toolCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
              >
                <span style={styles.toolIcon}>{tool.icon}</span>
                <h3 style={styles.toolTitle}>{tool.title}</h3>
                <p style={styles.toolDescription}>{tool.description}</p>
                <Link 
                  to={tool.link} 
                  style={styles.toolButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#764ba2';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#667eea';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {tool.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>Uma plataforma em constante evolução</h2>
          {loading ? (
            <div style={styles.loadingContainer}>
              Carregando estatísticas...
            </div>
          ) : (
            <div style={styles.statsGrid}>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.statNumber}>{stats.totalQuestions}+</div>
                <div style={styles.statLabel}>Questões Disponíveis</div>
              </div>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.statNumber}>{stats.totalAreas}</div>
                <div style={styles.statLabel}>Áreas Cobertas</div>
              </div>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.statNumber}>{stats.totalTopics}+</div>
                <div style={styles.statLabel}>Tópicos Abordados</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Final Section */}
      <section style={styles.ctaSection}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.ctaTitle}>Pronto para garantir a sua farda?</h2>
          {userInfo ? (
            <Link 
              to="/questions" 
              style={styles.ctaButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
            >
              Começar a Estudar Agora
            </Link>
          ) : (
            <Link 
              to="/register" 
              style={styles.ctaButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
            >
              Criar Minha Conta Gratuitamente
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;