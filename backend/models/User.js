// /backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Garante que não haverá dois emails iguais
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// Middleware "pre-save": Roda ANTES de um documento User ser salvo
UserSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, pula para o próximo passo
  if (!this.isModified('password')) {
    next();
  }
  // Gera o "sal" e criptografa a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar a senha digitada com a senha criptografada no banco
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);