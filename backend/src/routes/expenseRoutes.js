const express = require('express');
const ExpenseController = require('../controllers/ExpenseController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rota para obter despesas por categoria (tela 'Comida')
router.get('/:walletId/category/:categoryName', authMiddleware, ExpenseController.getExpensesByCategory);

// Rota para adicionar uma nova despesa (tela 'Novo')
router.post('/:walletId', authMiddleware, ExpenseController.addExpense);

module.exports = router;