const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id',
      },
    },
    paidById: { // ID do usuário do SplitBank que pagou a despesa
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: { // Ex: 'Comida', 'Transporte', 'Casa'
      type: DataTypes.STRING,
      allowNull: false,
    },
    expenseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'expenses',
  });

  Expense.associate = (models) => {
    Expense.belongsTo(models.Wallet, { foreignKey: 'walletId', as: 'wallet' });
    Expense.belongsTo(models.User, { foreignKey: 'paidById', as: 'paidBy' });
  };

  return Expense;
};