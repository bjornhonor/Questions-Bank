// /backend/controllers/resultController.js
const Result = require('../models/Result');
const Question = require('../models/Question');

const submitTestResult = async (req, res) => {
  try {
    const { answers } = req.body;
    const questionIds = Object.keys(answers);
    const questions = await Question.find({ '_id': { $in: questionIds } });

    const performanceByArea = {};
    let correctCount = 0;
    
    const detailedAnswers = questions.map(q => {
      const selectedOptionIndex = answers[q._id];
      const isCorrect = selectedOptionIndex === q.correctOptionIndex;
      
      if (isCorrect) {
        correctCount++;
      }
      
      if (!performanceByArea[q.area]) {
        performanceByArea[q.area] = { correct: 0, total: 0 };
      }
      performanceByArea[q.area].total++;
      if (isCorrect) {
        performanceByArea[q.area].correct++;
      }

      return {
        selectedOptionIndex,
        isCorrect,
      };
    });

    const result = new Result({
      // Usa o ID do usuário logado, que foi adicionado à requisição pelo middleware 'protect'
      userId: req.user._id,
      score: correctCount / questions.length,
      answers: detailedAnswers,
      performanceBySubject: performanceByArea,
    });

    await result.save();
    res.status(201).json(result);

  } catch (error) {
    console.error("ERRO AO SALVAR RESULTADO:", error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = { submitTestResult };