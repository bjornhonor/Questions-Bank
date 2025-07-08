// /backend/controllers/questionController.js
const Question = require('../models/Question');

const getAllQuestions = async (req, res) => {
  try {
    const filter = {};
    const { area, topic } = req.query;
    if (area) {
      filter.area = area;
    }
    if (topic) {
      filter.topic = topic;
    }

    const questions = await Question.find(filter);

    return res.status(200).json(questions); 

  } catch (error) {
    console.error("ERRO NO CONTROLLER (getAllQuestions):", error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('supportTextId');

    if (!question) {
      return res.status(404).json({ message: 'Questão não encontrada no banco' });
    }
    return res.json(question);
  } catch (error) {
    console.error("ERRO NO CONTROLLER (getQuestionById):", error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

const getRandomQuestionsByArea = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;

        const distinctAreas = await Question.distinct('area');
        const selectedAreas = distinctAreas.sort(() => 0.5 - Math.random()).slice(0, count);

        const questions = await Promise.all(
            selectedAreas.map(area => 
                Question.aggregate([
                    { $match: { area: area } },
                    { $sample: { size: 1 } }
                ])
            )
        );

        const flatQuestions = questions.flat();

        return res.json(flatQuestions);
    } catch (error) {
        console.error("ERRO NO CONTROLLER (getRandomQuestionsByArea):", error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getRandomQuestionsByArea,
};