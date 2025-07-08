// /backend/routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { submitTestResult } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

// A rota '/submit' agora passa primeiro pelo 'protect'.
// Se o token for válido, ele segue para o 'submitTestResult'.
router.post('/submit', protect, submitTestResult);

module.exports = router;