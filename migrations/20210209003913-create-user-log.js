'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
      },
      activity: {
        type: Sequelize.TEXT
      },
      ip: {
        type: Sequelize.STRING
      },
      ua: {
        type: Sequelize.TEXT
      },
      browser: {
        type: Sequelize.STRING
      },
      device: {
        type: Sequelize.STRING
      },
      os: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_logs');
  }
};