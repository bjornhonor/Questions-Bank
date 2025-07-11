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
    console.log("Buscando questão com ID:", req.params.id);
    
    const question = await Question.findById(req.params.id);

    if (!question) {
      console.log("Questão não encontrada para ID:", req.params.id);
      return res.status(404).json({ message: 'Questão não encontrada no banco' });
    }
    
    console.log("Questão encontrada:", question._id);
    return res.json(question);
  } catch (error) {
    console.error("ERRO NO CONTROLLER (getQuestionById):", error);
    console.error("ID da requisição:", req.params.id);
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

// ← NOVA FUNÇÃO PARA QUESTÕES ALEATÓRIAS SIMPLES
const getRandomQuestions = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        
        // Buscar questões aleatórias usando MongoDB aggregation
        const questions = await Question.aggregate([
            { $sample: { size: count } }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ 
                message: 'Nenhuma questão encontrada no banco de dados' 
            });
        }

        console.log(`Retornando ${questions.length} questões aleatórias`);
        return res.json(questions);
    } catch (error) {
        console.error("ERRO NO CONTROLLER (getRandomQuestions):", error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getRandomQuestionsByArea,
  getRandomQuestions, // ← EXPORTAR NOVA FUNÇÃO
};