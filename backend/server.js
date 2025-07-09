// /backend/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const path = require('path');

// Importar todas as rotas
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const simuladosRoutes = require('./routes/simuladosRoutes');
const statsRoutes = require('./routes/statsRoutes'); // ← NOVA ROTA ADICIONADA

// Conectar ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🖼️ Servir arquivos estáticos (imagens para questões)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Rota de teste da raiz
app.get('/', (req, res) => {
  res.send('API da Plataforma de Estudos está rodando!');
});

// Usar as rotas da API
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulados', simuladosRoutes);
app.use('/api/stats', statsRoutes); // ← NOVA ROTA PARA ESTATÍSTICAS

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Imagens disponíveis em: http://localhost:${PORT}/images/`);
  console.log(`Estatísticas disponíveis em: http://localhost:${PORT}/api/stats`);
});

/*
=== RESUMO DAS MODIFICAÇÕES ===

1. ✅ Criado HomePage.jsx com design moderno e responsivo
2. ✅ Implementada saudação personalizada para Gabrielle
3. ✅ Mantida consistência visual com QuestionsPage
4. ✅ Criada API otimizada para estatísticas (/api/stats)
5. ✅ Adicionado fallback para compatibilidade

=== ENDPOINTS DISPONÍVEIS ===

GET /api/stats - Estatísticas gerais da plataforma
GET /api/stats/dashboard/:userId - Estatísticas específicas do usuário  
GET /api/stats/areas - Estatísticas por área

=== RECURSOS DA HOMEPAGE ===

🎨 Design moderno com gradientes azul/roxo
📱 Totalmente responsivo
❤️ Saudação personalizada para Gabrielle
📊 Estatísticas dinâmicas em tempo real
🚀 Animações e efeitos hover
🔗 Navegação intuitiva entre seções
⚡ Performance otimizada com API dedicada

=== PRÓXIMOS PASSOS ===

1. Copiar HomePage.jsx para /frontend/src/pages/
2. Copiar statsRoutes.js para /backend/routes/
3. Atualizar server.js conforme este exemplo
4. Testar a nova página inicial
5. Personalizar cores/textos se necessário
*/