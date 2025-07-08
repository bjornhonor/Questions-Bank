// /backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getDetailedHistory } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Todas as rotas do dashboard precisam de autenticação
router.get('/stats', protect, getDashboardStats);
router.get('/history', protect, getDetailedHistory);

module.exports = router;