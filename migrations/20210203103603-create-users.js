'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate:{
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING
      },
      role_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:2,
        references: {
          model: "roles",
          key: "id",
        },
      },
      is_active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isVerified:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      verificationToken:{
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_password: {
        type: Sequelize.STRING
      },
      reset_password_expires: {
        type: Sequelize.DATE
      },
      createdBy:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:0
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
    await queryInterface.dropTable('users');
  }
};