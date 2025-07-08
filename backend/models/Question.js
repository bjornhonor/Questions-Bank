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
    required: false
  },

  // Anexos podem ser texto ou URLs de imagens
  // Para texto: string normal
  // Para imagem: URL que termina com .jpg, .png, .gif, .webp, etc.
  attachments: { 
    type: [String],
    required: false,
    default: []
  }
});

module.exports = mongoose.model('Question', QuestionSchema);