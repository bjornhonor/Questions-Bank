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
const dashboardRoutes = require('./routes/dashboardRoutes'); // ← ADICIONADO
const simuladosRoutes = require('./routes/simuladosRoutes');

// Conectar ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🖼️ NOVO: Servir arquivos estáticos (imagens para questões)
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
app.use('/api/dashboard', dashboardRoutes); // ← ADICIONADO
app.use('/api/simulados', simuladosRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Imagens disponíveis em: http://localhost:${PORT}/images/`);
});