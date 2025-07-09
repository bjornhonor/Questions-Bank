// /backend/routes/statsRoutes.js
const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Result = require('../models/Result');

const router = express.Router();

// GET /api/stats - Retorna estatísticas gerais da plataforma
router.get('/', async (req, res) => {
  try {
    // Buscar estatísticas das questões de forma otimizada
    const [questionStats, userCount, resultStats] = await Promise.all([
      // Agregação para contar questões e obter áreas/tópicos únicos
      Question.aggregate([
        {
          $group: {
            _id: null,
            totalQuestions: { $sum: 1 },
            areas: { $addToSet: '$area' },
            topics: { $addToSet: '$topic' }
          }
        },
        {
          $project: {
            totalQuestions: 1,
            totalAreas: { $size: '$areas' },
            totalTopics: { $size: '$topics' },
            areas: 1,
            topics: 1
          }
        }
      ]),
      
      // Contar total de usuários
      User.countDocuments(),
      
      // Estatísticas de resultados
      Result.aggregate([
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            totalQuestionsAnswered: { $sum: '$questionsAnswered' },
            averageScore: { $avg: '$score' }
          }
        }
      ])
    ]);

    // Preparar resposta
    const stats = questionStats[0] || {
      totalQuestions: 0,
      totalAreas: 0,
      totalTopics: 0,
      areas: [],
      topics: []
    };

    const result = resultStats[0] || {
      totalTests: 0,
      totalQuestionsAnswered: 0,
      averageScore: 0
    };

    res.json({
      questions: {
        total: stats.totalQuestions,
        areas: stats.totalAreas,
        topics: stats.totalTopics,
        areasList: stats.areas,
        topicsList: stats.topics
      },
      users: {
        total: userCount
      },
      results: {
        totalTests: result.totalTests,
        totalQuestionsAnswered: result.totalQuestionsAnswered,
        averageScore: Math.round(result.averageScore * 100) / 100 // Arredondar para 2 casas decimais
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas'
    });
  }
});

// GET /api/stats/dashboard/:userId - Estatísticas específicas do usuário
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar estatísticas específicas do usuário
    const [userResults, userStats] = await Promise.all([
      // Resultados do usuário
      Result.find({ userId }).sort({ createdAt: -1 }).limit(10),
      
      // Estatísticas agregadas do usuário
      Result.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            totalQuestionsAnswered: { $sum: '$questionsAnswered' },
            averageScore: { $avg: '$score' },
            bestScore: { $max: '$score' },
            totalStudyTime: { $sum: '$timeSpent' } // Se você tiver esse campo
          }
        }
      ])
    ]);

    const stats = userStats[0] || {
      totalTests: 0,
      totalQuestionsAnswered: 0,
      averageScore: 0,
      bestScore: 0,
      totalStudyTime: 0
    };

    // Calcular progresso por área (se disponível)
    const progressByArea = await Result.aggregate([
      { $match: { userId } },
      { $unwind: '$questionResults' },
      {
        $group: {
          _id: '$questionResults.area',
          correct: {
            $sum: {
              $cond: [{ $eq: ['$questionResults.isCorrect', true] }, 1, 0]
            }
          },
          total: { $sum: 1 },
          averageScore: { $avg: { $cond: [{ $eq: ['$questionResults.isCorrect', true] }, 1, 0] } }
        }
      },
      {
        $project: {
          area: '$_id',
          correct: 1,
          total: 1,
          percentage: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] }
        }
      }
    ]);

    res.json({
      userStats: {
        ...stats,
        averageScore: Math.round(stats.averageScore * 100) / 100,
        bestScore: Math.round(stats.bestScore * 100) / 100
      },
      recentResults: userResults,
      progressByArea,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas do usuário'
    });
  }
});

// GET /api/stats/areas - Lista todas as áreas com contagem de questões
router.get('/areas', async (req, res) => {
  try {
    const areaStats = await Question.aggregate([
      {
        $group: {
          _id: '$area',
          questionCount: { $sum: 1 },
          topics: { $addToSet: '$topic' }
        }
      },
      {
        $project: {
          area: '$_id',
          questionCount: 1,
          topicCount: { $size: '$topics' },
          topics: 1
        }
      },
      {
        $sort: { questionCount: -1 }
      }
    ]);

    res.json(areaStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas por área:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas por área'
    });
  }
});

module.exports = router;

// ========================================
// INSTRUÇÕES PARA INTEGRAÇÃO:
// ========================================

/*
1. Adicione esta rota no seu server.js:

   const statsRoutes = require('./routes/statsRoutes');
   app.use('/api/stats', statsRoutes);

2. Atualize o HomePage.jsx para usar a nova API:

   const response = await axios.get('http://localhost:5000/api/stats');
   const statsData = response.data;
   
   setStats({
     totalQuestions: statsData.questions.total,
     totalAreas: statsData.questions.areas,
     totalTopics: statsData.questions.topics
   });

3. Opcional - Criar um hook personalizado para reutilizar:

   // hooks/useStats.js
   import { useState, useEffect } from 'react';
   import axios from 'axios';

   export const useStats = () => {
     const [stats, setStats] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       const fetchStats = async () => {
         try {
           const response = await axios.get('http://localhost:5000/api/stats');
           setStats(response.data);
         } catch (err) {
           setError(err);
         } finally {
           setLoading(false);
         }
       };

       fetchStats();
     }, []);

     return { stats, loading, error };
   };
*/