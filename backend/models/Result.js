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
  answers: [{
    questionIndex: { type: Number, required: false },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
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