'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('external_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bank_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Adiciona uma restrição de unicidade para evitar duplicatas de userId/bankId
    await queryInterface.addConstraint('external_tokens', {
      fields: ['user_id', 'bank_id'],
      type: 'unique',
      name: 'unique_user_bank_token'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('external_tokens');
  }
};