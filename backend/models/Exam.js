// /backend/models/Exam.js
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('Exam', ExamSchema);