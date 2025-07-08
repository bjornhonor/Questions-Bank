// /backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  area: { type: String, required: true, index: true },
  topic: { type: String, required: true, index: true },

  // CAMPO MODIFICADO: A ligação com um Teste agora é opcional
  sourceTestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: false // <-- A MUDANÇA ESTÁ AQUI
  },

  attachments: { 
    type: [String],
    required: false
  }
});

module.exports = mongoose.model('Question', QuestionSchema);