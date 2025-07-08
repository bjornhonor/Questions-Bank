// /backend/routes/simuladosRoutes.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Simulado = require('../models/Simulado');

// Função auxiliar para embaralhar array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// GET /api/simulados/anos - Buscar anos disponíveis
router.get('/anos', async (req, res) => {
  try {
    // Buscar anos distintos das questões
    const anos = await Question.distinct('ano');
    const anosComCount = await Promise.all(
      anos.map(async (ano) => {
        const totalQuestoes = await Question.countDocuments({ ano });
        return { ano, totalQuestoes };
      })
    );
    
    res.json({
      success: true,
      anos: anosComCount.sort((a, b) => a.ano - b.ano)
    });
  } catch (error) {
    console.error('Erro ao buscar anos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/simulados/:ano - Buscar simulados de um ano específico
router.get('/:ano', async (req, res) => {
  try {
    const ano = parseInt(req.params.ano);
    
    // Verificar se existem simulados para este ano
    let simulados = await Simulado.find({ ano }).sort({ numero: 1 });
    
    // Se não existem simulados, gerar automaticamente
    if (simulados.length === 0) {
      simulados = await gerarSimuladosParaAno(ano);
    }
    
    res.json({
      success: true,
      simulados: simulados.map(s => ({
        id: s._id,
        nome: s.nome,
        ano: s.ano,
        numero: s.numero,
        totalQuestoes: s.totalQuestoes,
        proporcoes: Object.fromEntries(s.proporcoes),
        criadoEm: s.criadoEm
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar simulados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/simulados/:ano/:numero - Buscar simulado específico com questões
router.get('/:ano/:numero', async (req, res) => {
  try {
    const ano = parseInt(req.params.ano);
    const numero = parseInt(req.params.numero);
    
    const simulado = await Simulado.findOne({ ano, numero })
      .populate('questoes');
    
    if (!simulado) {
      return res.status(404).json({
        success: false,
        message: 'Simulado não encontrado'
      });
    }
    
    res.json({
      success: true,
      simulado: {
        id: simulado._id,
        nome: simulado.nome,
        ano: simulado.ano,
        numero: simulado.numero,
        totalQuestoes: simulado.totalQuestoes,
        proporcoes: Object.fromEntries(simulado.proporcoes),
        questoes: simulado.questoes,
        criadoEm: simulado.criadoEm
      }
    });
  } catch (error) {
    console.error('Erro ao buscar simulado específico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/simulados/gerar/:ano - Forçar regeneração de simulados para um ano
router.post('/gerar/:ano', async (req, res) => {
  try {
    const ano = parseInt(req.params.ano);
    
    // Remover simulados existentes
    await Simulado.deleteMany({ ano });
    
    // Gerar novos simulados
    const simulados = await gerarSimuladosParaAno(ano);
    
    res.json({
      success: true,
      message: `${simulados.length} simulados gerados para o ano ${ano}`,
      simulados: simulados.map(s => ({
        id: s._id,
        nome: s.nome,
        ano: s.ano,
        numero: s.numero,
        totalQuestoes: s.totalQuestoes
      }))
    });
  } catch (error) {
    console.error('Erro ao gerar simulados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Função para gerar 5 simulados para um ano específico
async function gerarSimuladosParaAno(ano) {
  console.log(`Gerando simulados para o ano ${ano}...`);
  
  // 1. Buscar todas as questões do ano
  const questoesAno = await Question.find({ ano });
  
  if (questoesAno.length === 0) {
    throw new Error(`Nenhuma questão encontrada para o ano ${ano}`);
  }
  
  // 2. Calcular proporções por área
  const areasCounts = {};
  questoesAno.forEach(questao => {
    if (!areasCounts[questao.area]) {
      areasCounts[questao.area] = 0;
    }
    areasCounts[questao.area]++;
  });
  
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
  
  // 3. Ajustar para garantir exatamente 12 questões
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
  
  console.log(`Proporções calculadas para ${ano}:`, proporcoes);
  
  // 4. Gerar 5 simulados
  const simulados = [];
  
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
    simulados.push(simulado);
    
    console.log(`Simulado ${ano}-${numero} criado com ${questoesFinais.length} questões`);
  }
  
  return simulados;
}

module.exports = router;