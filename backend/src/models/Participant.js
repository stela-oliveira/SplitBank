const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Participant = sequelize.define('Participant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: { // ID do usuário do SplitBank
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    walletId: { // ID da carteira compartilhada
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id',
      },
    },
    role: { // Ex: 'owner', 'member'
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member',
    },
  }, {
    tableName: 'participants', 
    indexes: [{ unique: true, fields: ['userId', 'walletId'] }] // Um usuário só pode ser participante de uma carteira uma vez
  });

  Participant.associate = (models) => {
    Participant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Participant.belongsTo(models.Wallet, { foreignKey: 'walletId', as: 'wallet' });
  };

  return Participant;
};