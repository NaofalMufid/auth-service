const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Model = Sequelize.Model;
class User extends Model {}

User.init(
  {
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: 'updated_at',
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'users',
  }
);

module.exports = User;
