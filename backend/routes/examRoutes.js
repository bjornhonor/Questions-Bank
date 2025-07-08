// /backend/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const { getAllExams } = require('../controllers/examController');

router.get('/', getAllExams);

// Garanta que a última linha seja esta:
module.exports = router;