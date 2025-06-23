const WalletService = require('../services/WalletService');
const { Wallet, Participant } = require('../models');

class ExpenseController {
  async getExpensesByCategory(req, res, next) {
    try {
      const { walletId, categoryName } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      // Verifique se o usuário é participante da carteira antes de buscar despesas
      const isParticipant = await Participant.findOne({
        where: { walletId: walletId, userId: userId }
      });

      if (!isParticipant) {
        return res.status(403).json({ message: 'User is not a participant of this wallet.' });
      }

      const expensesData = await WalletService.getExpensesByCategory(walletId, categoryName, startDate, endDate);
      if (!expensesData) {
        return res.status(404).json({ message: 'No expenses found for this category or wallet.' });
      }
      return res.status(200).json(expensesData);
    } catch (error) {
      next(error);
    }
  }

  async addExpense(req, res, next) {
    try {
      const { walletId } = req.params;
      const { description, value, category } = req.body;
      const paidById = req.userId;

      if (!description || !value || !category) {
        return res.status(400).json({ message: 'Description, value, and category are required.' });
      }
      if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        return res.status(400).json({ message: 'Value must be a positive number.' });
      }

      const isParticipant = await Participant.findOne({
        where: { walletId: walletId, userId: paidById }
      });

      if (!isParticipant) {
        return res.status(403).json({ message: 'User is not a participant of this wallet and cannot add expenses.' });
      }

      // Esta chamada agora funcionará porque o método existe no serviço
      const newExpense = await WalletService.addExpense(walletId, paidById, description, value, category);
      
      return res.status(201).json({
        message: 'Expense added successfully',
        expense: newExpense
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();