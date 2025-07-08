// /backend/models/Result.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  // CAMPO REINTRODUZIDO E AGORA OBRIGATÓRIO
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: false 
  },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  
  // Campos novos adicionados
  testType: { 
    type: String, 
    enum: ['regular', 'random'], 
    default: 'regular' 
  },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionIndex: { type: Number, required: false },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    // Campos adicionais para facilitar a exibição
    question: { type: String, required: false },
    area: { type: String, required: false },
    correctOptionIndex: { type: Number, required: false },
    options: [{ type: String, required: false }]
  }],
  
  performanceBySubject: {
    type: Map,
    of: {
      correct: Number,
      total: Number
    }
  }
});

module.exports = mongoose.model('Result', ResultSchema);