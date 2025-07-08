// /backend/db.js
const mongoose = require('mongoose');
// A linha 'require('dotenv').config();' foi removida daqui.

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar com o MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;