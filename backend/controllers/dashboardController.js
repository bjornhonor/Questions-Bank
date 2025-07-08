// /backend/controllers/dashboardController.js
const Result = require('../models/Result');
const Question = require('../models/Question');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Estatísticas gerais do usuário
    const totalTests = await Result.countDocuments({ userId });
    
    const results = await Result.find({ userId }).sort({ completedAt: -1 });
    
    const averageScore = results.length > 0 
      ? results.reduce((sum, result) => sum + result.score, 0) / results.length 
      : 0;

    const bestScore = results.length > 0 
      ? Math.max(...results.map(r => r.score)) 
      : 0;

    // 2. Performance por área - método simplificado para garantir que funcione
    let performanceByArea = [];
    
    if (results.length > 0) {
      // Coletamos todas as áreas de performance de todos os resultados
      const areaStats = {};
      
      for (const result of results) {
        if (result.performanceBySubject) {
          // performanceBySubject é um Map, então precisamos convertê-lo
          const perfMap = result.performanceBySubject;
          
          for (const [area, stats] of Object.entries(perfMap)) {
            if (!areaStats[area]) {
              areaStats[area] = { correct: 0, total: 0 };
            }
            areaStats[area].correct += stats.correct || 0;
            areaStats[area].total += stats.total || 0;
          }
        }
      }
      
      // Convertemos para o formato esperado
      performanceByArea = Object.entries(areaStats).map(([area, stats]) => ({
        area,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
      })).sort((a, b) => b.percentage - a.percentage);
    }

    // 3. Últimos 10 resultados para o gráfico de evolução
    const recentResults = results.slice(0, 10).reverse().map((result, index) => ({
      testNumber: index + 1,
      score: Math.round(result.score * 100),
      date: result.completedAt.toLocaleDateString('pt-BR'),
      completedAt: result.completedAt
    }));

    // 4. Estatísticas das questões do sistema (contexto geral)
    const totalQuestionsInSystem = await Question.countDocuments();
    const questionsByArea = await Question.aggregate([
      {
        $group: {
          _id: "$area",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 5. Métricas de tempo (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const testsLast30Days = await Result.countDocuments({
      userId,
      completedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      userStats: {
        totalTests,
        averageScore: Math.round(averageScore * 100),
        bestScore: Math.round(bestScore * 100),
        testsLast30Days
      },
      performanceByArea,
      recentResults,
      systemStats: {
        totalQuestionsInSystem,
        questionsByArea
      }
    });

  } catch (error) {
    console.error("ERRO NO DASHBOARD:", error);
    res.status(500).json({ message: 'Erro ao carregar dados do dashboard' });
  }
};

const getDetailedHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const results = await Result.find({ userId })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('score completedAt answers performanceBySubject');

    const total = await Result.countDocuments({ userId });

    const formattedResults = results.map(result => ({
      _id: result._id,
      score: Math.round(result.score * 100),
      totalQuestions: result.answers.length,
      correctAnswers: result.answers.filter(a => a.isCorrect).length,
      date: result.completedAt.toLocaleDateString('pt-BR'),
      time: result.completedAt.toLocaleTimeString('pt-BR'),
      completedAt: result.completedAt,
      performanceBySubject: result.performanceBySubject
    }));

    res.json({
      results: formattedResults,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error("ERRO NO HISTÓRICO DETALHADO:", error);
    res.status(500).json({ message: 'Erro ao carregar histórico' });
  }
};

module.exports = {
  getDashboardStats,
  getDetailedHistory
};