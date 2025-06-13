const { Wallet, Participant, Expense, User } = require('../models');
const { Op } = require('sequelize');

class WalletService {
  async getUserWalletsSummary(userId) {
    // Busca todas as carteiras em que o usuário é participante
    const participations = await Participant.findAll({
      where: { user_id: userId }, // Use user_id devido ao underscoredAll
      include: [{
        model: Wallet,
        as: 'wallet',
        include: [{
          model: Expense,
          as: 'expenses',
          attributes: ['amount', 'category', 'paidById']
        }]
      }]
    });

    let totalBalance = 0;
    let totalExpenses = 0;
    let sharedExpensesTotal = 0;

    participations.forEach(p => {
      const wallet = p.wallet;
      if (wallet && wallet.expenses) {
        wallet.expenses.forEach(expense => {
          const expenseAmount = parseFloat(expense.amount);

          // Soma o valor absoluto das despesas compartilhadas
          sharedExpensesTotal += Math.abs(expenseAmount);

          // Soma as despesas que o usuário logado pagou
          if (expense.paidById === userId) {
            totalExpenses += expenseAmount; // Se for uma despesa, já é negativa
          }
        });
      }
    });

    // Para simular os dados do frontend com valores fixos para balanço/despesas gerais
    // e um cálculo dinâmico para sharedExpensesTotal
    return {
      totalBalance: 7783.00,
      totalExpenses: -1187.40,
      sharedExpensesTotal: sharedExpensesTotal
    };
  }

  async getWalletDetails(walletId) {
    const wallet = await Wallet.findByPk(walletId, {
      include: [{
        model: Expense,
        as: 'expenses',
        attributes: ['amount', 'category', 'paidById']
      }, {
        model: Participant,
        as: 'participants',
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
      }]
    });

    if (!wallet) return null;

    let paidAmount = 0;
    let totalAmount = 0;

    wallet.expenses.forEach(expense => {
      totalAmount += parseFloat(expense.amount);
      // por enquanto, vamos usar um mock para o frontend
    });

    return {
      id: wallet.id,
      name: wallet.name,
      paidAmount: 2783.00, // Mockado para o frontend
      totalAmount: -6187.40, // Mockado para o frontend
      categories: [
        {"name": "Comida", "icon": "🍽️"},
        {"name": "Transporte", "icon": "🚗"},
        {"name": "Casa", "icon": "🏠"},
        {"name": "Mercado", "icon": "🛒"},
        {"name": "Aluguel", "icon": "🏡"},
        {"name": "Presentes", "icon": "🎁"},
        {"name": "Outros", "icon": "📦"},
        {"name": "Entretenimento", "icon": "🎬"}
      ]
    };
  }

  async getExpensesByCategory(walletId, categoryName, startDate, endDate) {
    const whereClause = { walletId, category: categoryName };

    if (startDate && endDate) {
      whereClause.expenseDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      whereClause.expenseDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.expenseDate = { [Op.lte]: new Date(endDate) };
    }

    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['expenseDate', 'DESC']],
      include: [{ model: User, as: 'paidBy', attributes: ['id', 'name'] }]
    });

    // Mockar dados para a tela de frontend 'Comida'
    const mockedPaid = categoryName.toLowerCase() === 'comida' ? 80.70 : 0;
    const mockedTotal = categoryName.toLowerCase() === 'comida' ? -480.90 : 0;

    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const date = new Date(expense.expenseDate);
      const month = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

      if (!acc[monthCapitalized]) {
        acc[monthCapitalized] = [];
      }
      acc[monthCapitalized].push({
        id: expense.id,
        description: expense.description,
        date: expense.expenseDate,
        amount: parseFloat(expense.amount),
        icon: this._getCategoryEmoji(expense.category)
      });
      return acc;
    }, {});

    return {
      categoryName: categoryName,
      paidAmount: mockedPaid,
      totalAmount: mockedTotal,
      monthlyExpenses: Object.keys(monthlyExpenses).map(month => ({
        month,
        expenses: monthlyExpenses[month]
      }))
    };
  }

  async addExpense(walletId, paidById, description, amount, category) {
    const expense = await Expense.create({
      walletId,
      paidById,
      description,
      amount: parseFloat(amount),
      category,
      expenseDate: new Date()
    });
    return expense;
  }

  async getTeamSummary(walletId) {
    const wallet = await Wallet.findByPk(walletId, {
      include: [{
        model: Participant,
        as: 'participants',
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
      }, {
        model: Expense,
        as: 'expenses',
        include: [{ model: User, as: 'paidBy', attributes: ['id', 'name'] }]
      }]
    });

    if (!wallet) return null;

    const totalParticipants = wallet.participants.length;
    let totalSpentCalculated = 0;

    wallet.expenses.forEach(expense => {
      totalSpentCalculated += Math.abs(parseFloat(expense.amount));
    });

    // Mockar dados para o frontend da tela 'Equipe'
    const participantExpenses = [
      { id: 'mock-stela-id', name: 'Stela', amount: -400.00, date: '2025-04-30' },
      { id: 'mock-eduarda-id', name: 'Eduarda', amount: -80.00, date: '2025-04-24' },
      { id: 'mock-luiz-id', name: 'Luiz', amount: -74.40, date: '2025-04-15' },
      { id: 'mock-fernanda-id', name: 'Fernanda', amount: -180.00, date: '2025-04-08' },
      { id: 'mock-rafaela-id', name: 'Rafaela', amount: -70.40, date: '2025-03-31', category: "Comida" },
      { id: 'mock-ana-id', name: 'Ana', amount: -70.40, date: '2025-03-31', category: "Mercado" }
    ];

    return {
      totalParticipants: totalParticipants,
      totalPaid: 1120.00, // Mockado para o frontend
      totalSpent: totalSpentCalculated,
      participantExpenses: participantExpenses
    };
  }

  // emojis de categoria
  _getCategoryEmoji(category) {
    const iconMap = {
      'Comida': '🍽️',
      'Transporte': '🚗',
      'Casa': '🏠',
      'Mercado': '🛒',
      'Aluguel': '🏡',
      'Presentes': '🎁',
      'Outros': '📦',
      'Entretenimento': '🎬',
    };
    return iconMap[category] || '💰';
  }
}

module.exports = new WalletService();