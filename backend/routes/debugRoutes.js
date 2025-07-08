// /backend/routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Rota para verificar questões
router.get('/questions', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const sampleQuestions = await Question.find().limit(5).select('_id area topic questionText');
    const areas = await Question.distinct('area');
    
    res.json({
      status: 'success',
      totalQuestions,
      areas,
      sampleQuestions: sampleQuestions.map(q => ({
        id: q._id,
        area: q.area,
        topic: q.topic,
        questionPreview: q.questionText.substring(0, 100) + '...'
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Rota para testar busca por ID específico
router.get('/question/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        status: 'not_found',
        message: `Questão com ID ${req.params.id} não encontrada`,
        searchedId: req.params.id
      });
    }
    
    res.json({
      status: 'found',
      question: {
        id: question._id,
        area: question.area,
        topic: question.topic,
        questionText: question.questionText,
        optionsCount: question.options.length,
        hasAttachments: question.attachments && question.attachments.length > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      searchedId: req.params.id
    });
  }
});

module.exports = router;