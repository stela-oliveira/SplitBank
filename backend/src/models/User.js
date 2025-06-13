const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: { // CPF do usuário do SplitBank
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'users', // Nome da tabela em minúsculas e plural
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Wallet, { foreignKey: 'ownerId', as: 'ownedWallets' });
    User.hasMany(models.Participant, { foreignKey: 'userId', as: 'participations' });
    User.hasMany(models.ExternalToken, { foreignKey: 'userId', as: 'externalTokens' });
  };

  return User;
};