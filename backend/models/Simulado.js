// /backend/models/Simulado.js
const mongoose = require('mongoose');

const SimuladoSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true, 
    unique: true // Ex: "2017-1", "2017-2", etc.
  },
  ano: { 
    type: Number, 
    required: true,
    index: true 
  },
  numero: { 
    type: Number, 
    required: true 
  },
  questoes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question',
    required: true 
  }],
  proporcoes: {
    type: Map,
    of: {
      questoesTotais: Number,
      porcentagem: Number,
      questoesSimulado: Number
    }
  },
  totalQuestoes: {
    type: Number,
    default: 12
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

// Índice composto para buscar por ano e número
SimuladoSchema.index({ ano: 1, numero: 1 });

module.exports = mongoose.model('Simulado', SimuladoSchema);