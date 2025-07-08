// /backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const questionsData = require('./data'); // Importa a lista simples de questões

// Importamos apenas o modelo que vamos usar
const Question = require('./models/Question');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log('Limpando a coleção de questões...');
    await Question.deleteMany(); // Limpa apenas as questões antigas
    console.log('Coleção de questões limpa.');

    console.log(`Inserindo ${questionsData.length} novas questões...`);
    // O método insertMany é perfeito para inserir um array de documentos de uma vez
    await Question.insertMany(questionsData);

    console.log('---------------------------------');
    console.log('NOVAS QUESTÕES INSERIDAS COM SUCESSO!');
    process.exit();
  } catch (error) {
    console.error('ERRO AO IMPORTAR DADOS:', error);
    process.exit(1);
  }
};

importData();