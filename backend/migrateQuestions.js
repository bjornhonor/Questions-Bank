// /backend/migrateQuestions.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Question = require('./models/Question');

dotenv.config();
connectDB();

const migrateQuestions = async () => {
  try {
    console.log('=== INICIANDO MIGRAÇÃO DAS QUESTÕES ===\n');
    
    // Verificar quantas questões não têm o campo 'ano'
    const questoesSemAno = await Question.countDocuments({ ano: { $exists: false } });
    console.log(`📊 Questões sem campo 'ano': ${questoesSemAno}`);
    
    if (questoesSemAno === 0) {
      console.log('✅ Todas as questões já possuem o campo ano. Migração não necessária.');
      process.exit();
    }
    
    // Atualizar questões baseado nos dados originais
    // Assumindo que as questões do data.js são todas de 2017
    const result = await Question.updateMany(
      { ano: { $exists: false } },
      { 
        $set: { 
          ano: 2017,
          numeroQuestao: 1 // Será ajustado depois se necessário
        }
      }
    );
    
    console.log(`✅ ${result.modifiedCount} questões atualizadas com sucesso!`);
    
    // Verificar o resultado
    const questoesComAno = await Question.countDocuments({ ano: { $exists: true } });
    console.log(`📊 Total de questões com campo 'ano': ${questoesComAno}`);
    
    // Mostrar distribuição por ano
    const distribuicaoPorAno = await Question.aggregate([
      { $group: { _id: '$ano', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 Distribuição por ano:');
    distribuicaoPorAno.forEach(item => {
      console.log(`   ${item._id}: ${item.total} questões`);
    });
    
    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    process.exit();
    
  } catch (error) {
    console.error('❌ ERRO NA MIGRAÇÃO:', error);
    process.exit(1);
  }
};

migrateQuestions();