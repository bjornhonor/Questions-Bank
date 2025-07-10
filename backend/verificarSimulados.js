// /backend/verificarSimulados.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Question = require('./models/Question');
const Simulado = require('./models/Simulado');

dotenv.config();
connectDB();

const verificarSimulados = async () => {
  try {
    console.log('=== VERIFICANDO SIMULADOS E QUESTÕES ===\n');
    
    // 1. Verificar anos disponíveis nas questões
    const anosDisponiveis = await Question.distinct('ano');
    console.log('📅 Anos com questões:', anosDisponiveis.sort());
    
    // 2. Para cada ano, mostrar estatísticas
    for (const ano of anosDisponiveis.sort()) {
      console.log(`\n📊 ANO ${ano}:`);
      
      // Contar questões por área
      const questoesPorArea = await Question.aggregate([
        { $match: { ano: ano } },
        { $group: { _id: '$area', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const totalQuestoes = await Question.countDocuments({ ano });
      console.log(`   Total de questões: ${totalQuestoes}`);
      console.log(`   Distribuição por área:`);
      
      let totalQuestoesSimulado = 0;
      questoesPorArea.forEach(area => {
        const porcentagem = (area.count / totalQuestoes) * 100;
        const questoesSimulado = Math.round((porcentagem / 100) * 12);
        totalQuestoesSimulado += Math.max(1, questoesSimulado);
        
        console.log(`     - ${area._id}: ${area.count} questões (${porcentagem.toFixed(1)}%) → ${Math.max(1, questoesSimulado)} questões no simulado`);
      });
      
      console.log(`   Total questões por simulado: ${Math.min(totalQuestoesSimulado, 12)}`);
      
      // Verificar se já existem simulados
      const simuladosExistentes = await Simulado.countDocuments({ ano });
      console.log(`   Simulados já criados: ${simuladosExistentes}/5`);
      
      if (simuladosExistentes === 0) {
        console.log(`   ⚠️  PRECISA GERAR SIMULADOS PARA ${ano}`);
      } else if (simuladosExistentes < 5) {
        console.log(`   ⚠️  SIMULADOS INCOMPLETOS PARA ${ano}`);
      } else {
        console.log(`   ✅ Simulados completos para ${ano}`);
      }
    }
    
    // 3. Resumo geral
    console.log('\n=== RESUMO GERAL ===');
    const totalSimulados = await Simulado.countDocuments();
    const simuladosEsperados = anosDisponiveis.length * 5;
    
    console.log(`Total de anos: ${anosDisponiveis.length}`);
    console.log(`Simulados existentes: ${totalSimulados}/${simuladosEsperados}`);
    
    if (totalSimulados < simuladosEsperados) {
      console.log('\n💡 PARA GERAR TODOS OS SIMULADOS:');
      console.log('   npm run generate-simulados');
      console.log('\n💡 PARA GERAR SIMULADOS DE UM ANO ESPECÍFICO:');
      console.log('   curl -X POST http://localhost:5000/api/simulados/gerar/2019');
    } else {
      console.log('\n🎉 Todos os simulados estão criados!');
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    process.exit();
    
  } catch (error) {
    console.error('❌ ERRO NA VERIFICAÇÃO:', error);
    process.exit(1);
  }
};

verificarSimulados();