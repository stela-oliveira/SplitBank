const express = require('express');
const WalletController = require('../controllers/WalletController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rota para o resumo da Home (saldo, despesas totais)
router.get('/summary', authMiddleware, WalletController.getSummary);

// Rota para detalhes da carteira (tela de despesas por categoria)
router.get('/:walletId', authMiddleware, WalletController.getWalletDetails);

module.exports = router;