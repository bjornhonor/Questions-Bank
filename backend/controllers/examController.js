// /backend/controllers/examController.js
const Exam = require('../models/Exam');

const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = {
  getAllExams,
};