// /backend/debug-questions.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Question = require('./models/Question');

dotenv.config();
connectDB();

const debugQuestions = async () => {
  try {
    console.log('=== INICIANDO DEBUG DAS QUESTÕES ===\n');
    
    // 1. Verificar total de questões
    const totalQuestions = await Question.countDocuments();
    console.log(`📊 Total de questões no banco: ${totalQuestions}\n`);
    
    if (totalQuestions === 0) {
      console.log('❌ NENHUMA QUESTÃO ENCONTRADA!');
      console.log('Execute: npm run seed para inserir as questões\n');
      process.exit();
    }
    
    // 2. Mostrar algumas questões de exemplo
    console.log('📖 Primeiras 3 questões:');
    const sampleQuestions = await Question.find().limit(3);
    
    sampleQuestions.forEach((q, index) => {
      console.log(`\n${index + 1}. ID: ${q._id}`);
      console.log(`   Área: ${q.area}`);
      console.log(`   Tópico: ${q.topic}`);
      console.log(`   Pergunta: ${q.questionText.substring(0, 100)}...`);
      console.log(`   Opções: ${q.options.length}`);
      console.log(`   Anexos: ${q.attachments ? q.attachments.length : 0}`);
    });
    
    // 3. Verificar áreas disponíveis
    console.log('\n📚 Áreas disponíveis:');
    const areas = await Question.distinct('area');
    areas.forEach(area => {
      console.log(`   - ${area}`);
    });
    
    // 4. Testar busca por ID específico
    console.log('\n🔍 Testando busca por ID...');
    const firstQuestion = await Question.findOne();
    if (firstQuestion) {
      const foundById = await Question.findById(firstQuestion._id);
      if (foundById) {
        console.log(`✅ Busca por ID funcionando! ID testado: ${firstQuestion._id}`);
      } else {
        console.log(`❌ Erro na busca por ID: ${firstQuestion._id}`);
      }
    }
    
    console.log('\n=== DEBUG CONCLUÍDO ===');
    process.exit();
    
  } catch (error) {
    console.error('❌ ERRO NO DEBUG:', error);
    process.exit(1);
  }
};

debugQuestions();