// /frontend/src/pages/HomePage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function HomePage() {
  const { userInfo } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalQuestoes: 0,
    totalAreas: 0,
    totalSimulados: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSimuladosCount();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(prevStats => ({
          ...prevStats,
          totalQuestoes: data.questions.total,
          totalAreas: data.questions.areas
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchSimuladosCount = async () => {
    try {
      // Buscar anos disponíveis
      const anosResponse = await fetch('http://localhost:5000/api/simulados/anos');
      if (anosResponse.ok) {
        const anosData = await anosResponse.json();
        
        if (anosData.success && anosData.anos.length > 0) {
          // Para cada ano, buscar quantos simulados existem
          let totalSimulados = 0;
          
          for (const anoInfo of anosData.anos) {
            try {
              const simuladosResponse = await fetch(`http://localhost:5000/api/simulados/${anoInfo.ano}`);
              if (simuladosResponse.ok) {
                const simuladosData = await simuladosResponse.json();
                if (simuladosData.success) {
                  totalSimulados += simuladosData.simulados.length;
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar simulados do ano ${anoInfo.ano}:`, error);
            }
          }
          
          setStats(prevStats => ({
            ...prevStats,
            totalSimulados
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de simulados:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userInfo?.name || 'Estudante';
    
    if (hour < 12) return `Bom dia, ${name}! ☀️`;
    if (hour < 18) return `Boa tarde, ${name}! 🌤️`;
    return `Boa noite, ${name}! 🌙`;
  };

  const styles = {
    container: {
      margin: '0',
      padding: '0',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    
    // Hero Section
    heroSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '100px 20px',
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
    heroGreeting: {
      fontSize: '1.3rem',
      fontWeight: '500',
      marginBottom: '20px',
      opacity: '0.95'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '700',
      marginBottom: '30px',
      lineHeight: '1.2'
    },
    heroSubtitle: {
      fontSize: '1.3rem',
      marginBottom: '40px',
      lineHeight: '1.6',
      opacity: '0.9'
    },
    heroCTA: {
      display: 'inline-block',
      padding: '18px 40px',
      fontSize: '1.2rem',
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
    toolsContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    toolsTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '20px',
      color: '#2c3e50'
    },
    toolsSubtitle: {
      fontSize: '1.2rem',
      textAlign: 'center',
      marginBottom: '60px',
      color: '#7f8c8d',
      lineHeight: '1.6'
    },
    toolsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      marginTop: '50px'
    },
    toolCard: {
      backgroundColor: 'white',
      padding: '40px 30px',
      borderRadius: '20px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      border: '1px solid #f1f3f4'
    },
    toolIcon: {
      fontSize: '4rem',
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
      color: '#7f8c8d',
      lineHeight: '1.6',
      marginBottom: '25px'
    },
    toolButton: {
      display: 'inline-block',
      padding: '12px 30px',
      backgroundColor: '#667eea',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '25px',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer'
    },

    // Stats Section
    statsSection: {
      padding: '80px 20px',
      backgroundColor: '#f8f9fa'
    },
    statsContainer: {
      maxWidth: '1000px',
      margin: '0 auto',
      textAlign: 'center'
    },
    statsTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '50px',
      color: '#2c3e50'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
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
      icon: '📖',
      title: 'Banco de Questões',
      description: 'Filtre por área e tópico, pratique com questões de provas anteriores e reforce seu conhecimento.',
      link: '/questions',
      buttonText: 'Explorar Questões'
    },
    {
      icon: '⏱️',
      title: 'Simulados',
      description: 'Teste seus conhecimentos com adaptações de 10 a 12 questões que respeitam a proporção da prova real do concurso.',
      link: '/simulados',
      buttonText: 'Ver Simulados'
    },
    {
      icon: '✍️',
      title: 'Redação',
      description: 'Pratique redação com temas de provas passadas. Escreva sua redação e receba correção personalizada para melhorar sua escrita.',
      link: '/redacao',
      buttonText: 'Praticar Redação'
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
            Você vai encontrar todas as questões anteriores aqui, organizadas e prontas para seus estudos completos e direcionados.
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
              Começar Agora →
            </Link>
          )}
        </div>
      </section>

      {/* Tools Section */}
      <section style={styles.toolsSection}>
        <div style={styles.toolsContainer}>
          <h2 style={styles.toolsTitle}>Escolha por onde começar</h2>
          <p style={styles.toolsSubtitle}>
            Nossa plataforma oferece todas as ferramentas que você precisa para se preparar de forma completa e eficiente.
          </p>
          
          <div style={styles.toolsGrid}>
            {tools.map((tool, index) => (
              <div 
                key={index}
                style={styles.toolCard}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                <span style={styles.toolIcon}>{tool.icon}</span>
                <h3 style={styles.toolTitle}>{tool.title}</h3>
                <p style={styles.toolDescription}>{tool.description}</p>
                <Link 
                  to={tool.link} 
                  style={styles.toolButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a67d8';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#667eea';
                    e.target.style.transform = 'translateY(0)';
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
        <div style={styles.statsContainer}>
          <h2 style={styles.statsTitle}>Nossa plataforma em números</h2>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              Carregando estatísticas...
            </div>
          ) : (
            <div style={styles.statsGrid}>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div style={styles.statNumber}>{stats.totalQuestoes}</div>
                <div style={styles.statLabel}>Questões Disponíveis</div>
              </div>
              
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div style={styles.statNumber}>{stats.totalAreas}</div>
                <div style={styles.statLabel}>Áreas de Conhecimento</div>
              </div>
              
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div style={styles.statNumber}>{stats.totalSimulados}</div>
                <div style={styles.statLabel}>Simulados Disponíveis</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Pronto para começar sua jornada?</h2>
        <Link 
          to="/tests" 
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
          Explorar Testes →
        </Link>
      </section>
    </div>
  );
}

export default HomePage;