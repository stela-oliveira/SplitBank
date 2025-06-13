const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId: { // ID do usuário do SplitBank que criou a carteira
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // Nome da tabela do modelo User
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'wallets', // Nome da tabela em minúsculas e plural
  });

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    Wallet.hasMany(models.Participant, { foreignKey: 'walletId', as: 'participants' });
    Wallet.hasMany(models.Expense, { foreignKey: 'walletId', as: 'expenses' });
  };

  return Wallet;
};