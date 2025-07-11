// /backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { getAllQuestions, getQuestionById, getRandomQuestionsByArea, getRandomQuestions } = require('../controllers/questionController');

router.get('/', getAllQuestions);
router.get('/random-by-area', getRandomQuestionsByArea);
router.get('/random', getRandomQuestions); // ← NOVA ROTA PARA QUESTÕES ALEATÓRIAS
router.get('/:id', getQuestionById);

module.exports = router;