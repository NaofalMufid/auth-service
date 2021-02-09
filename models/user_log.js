'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_log.init({
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activity: DataTypes.STRING,
    ip: DataTypes.STRING,
    ua: DataTypes.TEXT,
    browser: DataTypes.STRING,
    device: DataTypes.STRING,
    os: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_log',
  });
  user_log.associate = function (models) {
    user_log.belongsTo(models.users, {
      foreignKey: "user_id"
    });
  };
  return user_log;
};