const express = require('express');
const TeamController = require('../controllers/TeamController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rota para obter o resumo da equipe (tela 'Equipe')
router.get('/:walletId/summary', authMiddleware, TeamController.getTeamSummary);

module.exports = router;