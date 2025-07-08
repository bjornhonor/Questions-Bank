// /backend/controllers/resultController.js
const Result = require('../models/Result');
const Question = require('../models/Question');

const submitTestResult = async (req, res) => {
  try {
    const { answers, questions } = req.body;
    
    // Se questions foi enviado junto (teste aleatório), use elas
    // Caso contrário, busque no banco (teste regular)
    let questionData;
    
    if (questions && Array.isArray(questions)) {
      // Teste aleatório - questões já foram enviadas
      questionData = questions;
    } else {
      // Teste regular - buscar questões no banco
      const questionIds = Object.keys(answers);
      questionData = await Question.find({ '_id': { $in: questionIds } });
    }

    if (!questionData || questionData.length === 0) {
      return res.status(400).json({ message: 'Nenhuma questão encontrada' });
    }

    const performanceByArea = {};
    let correctCount = 0;
    
    const detailedAnswers = questionData.map(q => {
      const selectedOptionIndex = answers[q._id];
      const isCorrect = selectedOptionIndex === q.correctOptionIndex;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Agrupar performance por área
      if (!performanceByArea[q.area]) {
        performanceByArea[q.area] = { correct: 0, total: 0 };
      }
      performanceByArea[q.area].total++;
      if (isCorrect) {
        performanceByArea[q.area].correct++;
      }

      return {
        questionId: q._id,
        selectedOptionIndex,
        isCorrect,
        question: q.question,
        area: q.area,
        correctOptionIndex: q.correctOptionIndex,
        options: q.options
      };
    });

    const score = correctCount / questionData.length;
    
    const result = new Result({
      userId: req.user._id,
      score: score,
      answers: detailedAnswers,
      performanceBySubject: performanceByArea,
      testType: questions ? 'random' : 'regular', // Identificar tipo de teste
      totalQuestions: questionData.length,
      correctAnswers: correctCount
    });

    await result.save();
    
    // Retornar resultado detalhado
    res.status(201).json({
      _id: result._id,
      score: Math.round(score * 100),
      totalQuestions: questionData.length,
      correctAnswers: correctCount,
      performanceByArea: Object.entries(performanceByArea).map(([area, stats]) => ({
        area,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      })),
      detailedAnswers,
      completedAt: result.completedAt
    });

  } catch (error) {
    console.error("ERRO AO SALVAR RESULTADO:", error);
    res.status(500).json({ message: 'Erro no servidor ao salvar resultado' });
  }
};

module.exports = { submitTestResult };