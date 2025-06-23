const db = require('../models');
const { Wallet, Participant, User, Expense } = db;
const { sequelize } = db;
const { Op } = require('sequelize'); // Importa o operador para as queries

class WalletService {

  // Método para criar uma nova carteira
  async createWallet(name, description, ownerId) {
    const transaction = await sequelize.transaction();
    try {
      const wallet = await Wallet.create({ name, description, ownerId }, { transaction });
      await Participant.create({ userId: ownerId, walletId: wallet.id, role: 'admin' }, { transaction });
      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Método para adicionar uma nova despesa
  async addExpense(walletId, paidById, description, value, category) {
    const newExpense = await Expense.create({
      walletId,
      paidById,
      description,
      amount: parseFloat(value),
      category,
      expenseDate: new Date(),
    });
    return newExpense;
  }

  // Método para o resumo da Home
  async getUserWalletsSummary(userId) {
    const participations = await Participant.findAll({
      where: { userId },
      include: [{
        model: Wallet,
        as: 'wallet',
        include: [{ model: Expense, as: 'expenses' }]
      }]
    });

    let totalPaidByUser = 0;
    let totalSpentInWallets = 0;

    participations.forEach(p => {
      const wallet = p.wallet;
      if (wallet && wallet.expenses) {
        wallet.expenses.forEach(expense => {
          const expenseAmount = parseFloat(expense.amount);
          totalSpentInWallets += expenseAmount;
          if (expense.paidById === userId) {
            totalPaidByUser += expenseAmount;
          }
        });
      }
    });

    const balance = totalPaidByUser - (totalSpentInWallets / (participations[0]?.wallet.participants?.length || 1));

    return {
      totalBalance: balance, // Saldo calculado
      totalExpenses: totalPaidByUser,
      sharedExpensesTotal: totalSpentInWallets
    };
  }

  // Método para os detalhes da carteira
  async getWalletDetails(walletId) {
    const wallet = await Wallet.findByPk(walletId, {
      include: [
        { model: Expense, as: 'expenses' },
        {
          model: Participant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });
    if (!wallet) return null;
    const totalAmount = wallet.expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
    const categories = Array.from(new Set(wallet.expenses.map(e => e.category)));

    return {
      id: wallet.id, name: wallet.name,
      totalAmount,
      categories: categories.map(cat => ({ name: cat, icon: this._getCategoryEmoji(cat) }))
    };
  }
  
  // Método para buscar despesas por categoria
  async getExpensesByCategory(walletId, categoryName, startDate, endDate) {
    const whereClause = { walletId, category: categoryName };
    if (startDate && endDate) { whereClause.expenseDate = { [Op.between]: [new Date(startDate), new Date(endDate)] }; }

    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['expenseDate', 'DESC']],
      include: [{ model: User, as: 'paidBy', attributes: ['id', 'name'] }]
    });

    const totalAmountInCategory = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
    
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const date = new Date(expense.expenseDate);
      const month = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
      if (!acc[monthCapitalized]) { acc[monthCapitalized] = []; }
      acc[monthCapitalized].push({
        id: expense.id, description: expense.description, date: expense.expenseDate,
        amount: parseFloat(expense.amount),
        icon: this._getCategoryEmoji(expense.category)
      });
      return acc;
    }, {});

    return {
      categoryName: categoryName,
      totalAmount: totalAmountInCategory,
      monthlyExpenses: Object.keys(monthlyExpenses).map(month => ({ month, expenses: monthlyExpenses[month] }))
    };
  }

  // Método para o resumo da equipe (com dados reais)
  async getTeamSummary(walletId) {
    const wallet = await Wallet.findByPk(walletId, {
      include: [
        { model: Participant, as: 'participants', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] },
        { model: Expense, as: 'expenses', include: [{ model: User, as: 'paidBy', attributes: ['id', 'name'] }] }
      ]
    });

    if (!wallet) return null;

    const totalSpent = wallet.expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
    const totalPaid = totalSpent;
    const participantExpenses = wallet.expenses.map(expense => ({
      id: expense.id, name: expense.paidBy.name,
      amount: -parseFloat(expense.amount),
      date: expense.expenseDate, category: expense.category
    }));

    return {
      totalParticipants: wallet.participants.length,
      totalPaid, totalSpent,
      participantExpenses
    };
  }

  _getCategoryEmoji(category) {
    const iconMap = {
      'Alimentação': '🍽️', 'Comida': '🍽️',
      'Transporte': '🚗', 'Casa': '🏠', 'Mercado': '🛒',
      'Aluguel': '🏡', 'Presentes': '🎁', 'Outros': '📦',
      'Entretenimento': '🎬',
    };
    return iconMap[category] || '💰';
  }
}

module.exports = new WalletService();