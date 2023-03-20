const { Sequelize } = require('sequelize');
const config = require('./config')[process.env.NODE_ENV];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: config.logging,
});

module.exports = sequelize;
