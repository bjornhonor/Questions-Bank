// /backend/generateSimulados.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Question = require('./models/Question');
const Simulado = require('./models/Simulado');

dotenv.config();
connectDB();

const generateSimulados = async () => {
  try {
    console.log('=== INICIANDO GERAÇÃO DE SIMULADOS ===\n');
    
    // 1. Verificar anos disponíveis
    const anosDisponiveis = await Question.distinct('ano');
    console.log('📅 Anos disponíveis:', anosDisponiveis);
    
    if (anosDisponiveis.length === 0) {
      console.log('❌ Nenhuma questão encontrada! Execute primeiro:');
      console.log('   npm run seed');
      console.log('   npm run migrate-questions');
      process.exit();
    }
    
    // 2. Para cada ano, gerar simulados se não existirem
    for (const ano of anosDisponiveis) {
      console.log(`\n🎯 Processando ano ${ano}...`);
      
      // Verificar se já existem simulados para este ano
      const simuladosExistentes = await Simulado.countDocuments({ ano });
      
      if (simuladosExistentes > 0) {
        console.log(`   ⚠️  ${simuladosExistentes} simulados já existem para ${ano}. Pulando...`);
        continue;
      }
      
      // Buscar questões do ano
      const questoesAno = await Question.find({ ano });
      console.log(`   📚 ${questoesAno.length} questões encontradas para ${ano}`);
      
      if (questoesAno.length < 12) {
        console.log(`   ❌ Não há questões suficientes (mínimo 12) para gerar simulados de ${ano}`);
        continue;
      }
      
      // Calcular proporções por área
      const areasCounts = {};
      questoesAno.forEach(questao => {
        if (!areasCounts[questao.area]) {
          areasCounts[questao.area] = 0;
        }
        areasCounts[questao.area]++;
      });
      
      console.log(`   📊 Áreas encontradas:`, Object.keys(areasCounts));
      
      const totalQuestoes = questoesAno.length;
      const proporcoes = {};
      
      Object.entries(areasCounts).forEach(([area, count]) => {
        const porcentagem = (count / totalQuestoes) * 100;
        const questoesSimulado = Math.round((porcentagem / 100) * 12);
        
        proporcoes[area] = {
          questoesTotais: count,
          porcentagem: porcentagem,
          questoesSimulado: Math.max(1, questoesSimulado) // Mínimo 1 questão por área
        };
      });
      
      // Ajustar para garantir exatamente 12 questões
      let totalSimulado = Object.values(proporcoes).reduce((sum, prop) => sum + prop.questoesSimulado, 0);
      
      while (totalSimulado !== 12) {
        if (totalSimulado < 12) {
          // Adicionar questões nas áreas com mais questões
          const areaComMaisQuestoes = Object.entries(proporcoes)
            .sort((a, b) => b[1].questoesTotais - a[1].questoesTotais)[0][0];
          proporcoes[areaComMaisQuestoes].questoesSimulado++;
          totalSimulado++;
        } else {
          // Remover questões das áreas com menos questões (mas não deixar < 1)
          const areaComMenosQuestoes = Object.entries(proporcoes)
            .filter(([_, prop]) => prop.questoesSimulado > 1)
            .sort((a, b) => a[1].questoesTotais - b[1].questoesTotais)[0];
          
          if (areaComMenosQuestoes) {
            proporcoes[areaComMenosQuestoes[0]].questoesSimulado--;
            totalSimulado--;
          } else {
            break;
          }
        }
      }
      
      console.log(`   🔢 Proporções calculadas:`, proporcoes);
      
      // Gerar 5 simulados para este ano
      for (let numero = 1; numero <= 5; numero++) {
        const questoesSimulado = [];
        
        // Para cada área, selecionar aleatoriamente as questões necessárias
        for (const [area, prop] of Object.entries(proporcoes)) {
          const questoesDaArea = questoesAno.filter(q => q.area === area);
          const questoesEmbalhadas = shuffleArray(questoesDaArea);
          const questoesSelecionadas = questoesEmbalhadas.slice(0, prop.questoesSimulado);
          
          questoesSimulado.push(...questoesSelecionadas);
        }
        
        // Embaralhar a ordem final das questões
        const questoesFinais = shuffleArray(questoesSimulado);
        
        // Criar o simulado
        const simulado = new Simulado({
          nome: `${ano}-${numero}`,
          ano: ano,
          numero: numero,
          questoes: questoesFinais.map(q => q._id),
          proporcoes: new Map(Object.entries(proporcoes)),
          totalQuestoes: questoesFinais.length
        });
        
        await simulado.save();
        console.log(`   ✅ Simulado ${ano}-${numero} criado com ${questoesFinais.length} questões`);
      }
    }
    
    // 3. Mostrar resumo final
    console.log('\n=== RESUMO FINAL ===');
    const totalSimulados = await Simulado.countDocuments();
    console.log(`📊 Total de simulados criados: ${totalSimulados}`);
    
    const simuladosPorAno = await Simulado.aggregate([
      { $group: { _id: '$ano', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('📈 Simulados por ano:');
    simuladosPorAno.forEach(item => {
      console.log(`   ${item._id}: ${item.total} simulados`);
    });
    
    console.log('\n🎉 GERAÇÃO DE SIMULADOS CONCLUÍDA!');
    process.exit();
    
  } catch (error) {
    console.error('❌ ERRO NA GERAÇÃO:', error);
    process.exit(1);
  }
};

// Função auxiliar para embaralhar array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

generateSimulados();