// /frontend/src/components/DebugInfo.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function DebugInfo() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/debug/questions');
        setDebugData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados de debug:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  const testQuestionById = async () => {
    if (!testId.trim()) return;
    
    setTestLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/debug/question/${testId.trim()}`);
      setTestResult(response.data);
    } catch (error) {
      setTestResult({
        status: 'error',
        error: error.response?.data?.message || error.message,
        searchedId: testId
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Carregando informações de debug...</div>;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔧 Debug - Informações das Questões</h3>
      
      {debugData && (
        <div style={styles.section}>
          <h4>📊 Estatísticas Gerais</h4>
          <div style={styles.statGrid}>
            <div style={styles.statCard}>
              <strong>Total de Questões:</strong> {debugData.totalQuestions}
            </div>
            <div style={styles.statCard}>
              <strong>Áreas Disponíveis:</strong> {debugData.areas.length}
            </div>
          </div>
          
          <h4>📚 Áreas:</h4>
          <div style={styles.areasList}>
            {debugData.areas.map((area, index) => (
              <span key={index} style={styles.areaTag}>{area}</span>
            ))}
          </div>
          
          <h4>📖 Questões de Exemplo:</h4>
          <div style={styles.questionsList}>
            {debugData.sampleQuestions.map((q, index) => (
              <div key={index} style={styles.questionCard}>
                <div><strong>ID:</strong> {q.id}</div>
                <div><strong>Área:</strong> {q.area}</div>
                <div><strong>Tópico:</strong> {q.topic}</div>
                <div><strong>Preview:</strong> {q.questionPreview}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={styles.section}>
        <h4>🔍 Testar Questão por ID</h4>
        <div style={styles.testSection}>
          <input
            type="text"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="Cole o ID da questão aqui"
            style={styles.input}
          />
          <button
            onClick={testQuestionById}
            disabled={testLoading || !testId.trim()}
            style={styles.button}
          >
            {testLoading ? 'Testando...' : 'Testar'}
          </button>
        </div>
        
        {testResult && (
          <div style={{
            ...styles.testResult,
            backgroundColor: testResult.status === 'found' ? '#f0f9f0' : '#fef7f7',
            borderColor: testResult.status === 'found' ? '#34a853' : '#ea4335'
          }}>
            <strong>Resultado do Teste:</strong>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {debugData?.sampleQuestions?.length > 0 && (
        <div style={styles.section}>
          <h4>🎯 Links Rápidos para Testar</h4>
          <div style={styles.quickLinks}>
            {debugData.sampleQuestions.map((q, index) => (
              <a
                key={index}
                href={`/questions/${q.id}`}
                style={styles.quickLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Testar Questão {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  title: {
    color: '#856404',
    marginTop: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#856404',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ffeaa7',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ffeaa7',
  },
  areasList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  areaTag: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #ffeaa7',
  },
  testSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ffeaa7',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  testResult: {
    padding: '15px',
    borderRadius: '6px',
    border: '2px solid',
    marginTop: '10px',
  },
  quickLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  quickLink: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default DebugInfo;