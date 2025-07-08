// /backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  area: { type: String, required: true, index: true },
  topic: { type: String, required: true, index: true },
  
  // CAMPO ADICIONADO: Ano da questão para organizar simulados
  ano: { 
    type: Number, 
    required: true, 
    index: true 
  },
  
  // CAMPO ADICIONADO: Número da questão no exame original
  numeroQuestao: { 
    type: Number, 
    required: false 
  },

  // A ligação com um Teste agora é opcional
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

// Índices para melhor performance
QuestionSchema.index({ ano: 1, area: 1 });
QuestionSchema.index({ ano: 1, numeroQuestao: 1 });

module.exports = mongoose.model('Question', QuestionSchema);