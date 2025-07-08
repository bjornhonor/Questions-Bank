// /backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { getAllQuestions, getQuestionById, getRandomQuestionsByArea } = require('../controllers/questionController');

router.get('/', getAllQuestions);
router.get('/random-by-area', getRandomQuestionsByArea); // <-- NOVA ROTA
router.get('/:id', getQuestionById);

module.exports = router;