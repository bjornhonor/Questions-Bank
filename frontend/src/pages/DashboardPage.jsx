// /frontend/src/pages/DashboardPage.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TestHistory from '../components/TestHistory';

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userInfo?.token) return;

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const response = await axios.get('http://localhost:5000/api/dashboard/stats', config);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar os dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userInfo]);

  if (loading) return <div style={styles.loading}>Carregando dashboard...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!dashboardData) return <div style={styles.error}>Dados não encontrados</div>;

  const { userStats, performanceByArea, recentResults, systemStats } = dashboardData;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>

      {/* Cards de Estatísticas Principais */}
      <div style={styles.statsGrid}>
        <StatCard 
          title="Testes Realizados" 
          value={userStats.totalTests}
          icon="📊"
          color="#4285f4"
        />
        <StatCard 
          title="Pontuação Média" 
          value={`${userStats.averageScore}%`}
          icon="🎯"
          color="#34a853"
        />
        <StatCard 
          title="Melhor Pontuação" 
          value={`${userStats.bestScore}%`}
          icon="🏆"
          color="#fbbc04"
        />
        <StatCard 
          title="Testes (30 dias)" 
          value={userStats.testsLast30Days}
          icon="📅"
          color="#ea4335"
        />
      </div>

      <div style={styles.chartsGrid}>
        {/* Performance por Área */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Performance por Área</h3>
          {performanceByArea.length > 0 ? (
            <div style={styles.performanceList}>
              {performanceByArea.map((area, index) => (
                <PerformanceBar 
                  key={index}
                  area={area.area}
                  percentage={Math.round(area.percentage)}
                  totalQuestions={area.totalQuestions}
                />
              ))}
            </div>
          ) : (
            <p style={styles.noData}>Nenhum teste realizado ainda</p>
          )}
        </div>

        {/* Evolução dos Resultados */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Últimos Resultados</h3>
          {recentResults.length > 0 ? (
            <div style={styles.evolutionChart}>
              {recentResults.map((result, index) => (
                <div key={index} style={styles.resultPoint}>
                  <div 
                    style={{
                      ...styles.resultBar,
                      height: `${result.score}%`,
                      backgroundColor: getScoreColor(result.score)
                    }}
                  />
                  <span style={styles.resultLabel}>{result.score}%</span>
                  <span style={styles.resultDate}>{result.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.noData}>Nenhum resultado para exibir</p>
          )}
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div style={styles.systemStats}>
        <h3 style={styles.chartTitle}>Estatísticas do Sistema</h3>
        <div style={styles.systemStatsGrid}>
          <div style={styles.systemStatCard}>
            <span style={styles.systemStatNumber}>{systemStats.totalQuestionsInSystem}</span>
            <span style={styles.systemStatLabel}>Total de Questões</span>
          </div>
          <div style={styles.systemStatCard}>
            <span style={styles.systemStatNumber}>{systemStats.questionsByArea.length}</span>
            <span style={styles.systemStatLabel}>Áreas Disponíveis</span>
          </div>
        </div>
      </div>

      {/* Histórico Recente de Testes */}
      <div style={styles.historySection}>
        <TestHistory limit={5} />
      </div>
    </div>
  );
}

// Componente para os cards de estatísticas
const StatCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statContent}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </div>
);

// Componente para barras de performance
const PerformanceBar = ({ area, percentage, totalQuestions }) => (
  <div style={styles.performanceItem}>
    <div style={styles.performanceHeader}>
      <span style={styles.performanceArea}>{area}</span>
      <span style={styles.performanceScore}>{percentage}%</span>
    </div>
    <div style={styles.performanceBarContainer}>
      <div 
        style={{
          ...styles.performanceBarFill,
          width: `${percentage}%`,
          backgroundColor: getScoreColor(percentage)
        }}
      />
    </div>
    <span style={styles.performanceQuestions}>{totalQuestions} questões</span>
  </div>
);

// Função para determinar a cor baseada na pontuação
const getScoreColor = (score) => {
  if (score >= 80) return '#34a853';
  if (score >= 60) return '#fbbc04';
  if (score >= 40) return '#ff9800';
  return '#ea4335';
};

// Estilos
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#202124',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2rem',
    color: '#5f6368',
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2rem',
    color: '#ea4335',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statIcon: {
    fontSize: '2rem',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#202124',
  },
  statTitle: {
    fontSize: '0.9rem',
    color: '#5f6368',
    marginTop: '5px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  chartContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#202124',
  },
  noData: {
    textAlign: 'center',
    color: '#5f6368',
    fontStyle: 'italic',
    padding: '20px',
  },
  performanceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  performanceItem: {
    padding: '15px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa',
  },
  performanceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  performanceArea: {
    fontWeight: 'bold',
    color: '#202124',
    fontSize: '0.9rem',
  },
  performanceScore: {
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  performanceBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#dadce0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  performanceQuestions: {
    fontSize: '0.8rem',
    color: '#5f6368',
  },
  evolutionChart: {
    display: 'flex',
    alignItems: 'end',
    gap: '8px',
    height: '200px',
    padding: '10px',
    overflowX: 'auto',
  },
  resultPoint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
    height: '100%',
  },
  resultBar: {
    width: '20px',
    minHeight: '10px',
    borderRadius: '2px 2px 0 0',
    transition: 'height 0.5s ease',
    marginTop: 'auto',
  },
  resultLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginTop: '5px',
    color: '#202124',
  },
  resultDate: {
    fontSize: '0.7rem',
    color: '#5f6368',
    marginTop: '2px',
    transform: 'rotate(-45deg)',
  },
  systemStats: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  systemStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  systemStatCard: {
    textAlign: 'center',
    padding: '20px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
  },
  systemStatNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  systemStatLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#5f6368',
    marginTop: '5px',
  },
  historySection: {
    marginTop: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

export default DashboardPage;