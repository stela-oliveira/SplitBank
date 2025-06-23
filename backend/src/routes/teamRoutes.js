const express = require('express');
const TeamController = require('../controllers/TeamController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/:walletId/summary', authMiddleware, TeamController.getTeamSummary);

router.post('/:walletId/participants', authMiddleware, TeamController.addParticipant);

module.exports = router;