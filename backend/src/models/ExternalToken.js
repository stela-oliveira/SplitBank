const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExternalToken = sequelize.define('ExternalToken', {
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
    bankId: { // Identificador da API externa (e.g., 'mini-banco-central', 'api-banco-central')
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: { // Token de acesso fornecido pela API externa
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'external_tokens',
    indexes: [{ unique: true, fields: ['userId', 'bankId'] }] // Um usuário só pode ter um token por banco
  });

  ExternalToken.associate = (models) => {
    ExternalToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ExternalToken;
};