'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  users.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        len: [4,15]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        min: 6
      }
    },
    role_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:2,
      references:{
        model: "roles",
        key: "id",
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isVerified:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
    verificationToken:{
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_password: DataTypes.STRING,
    reset_password_expires: DataTypes.DATE,    
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'users',
  });

  // compare password
  users.prototype.checkPassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };
  users.associate = function (models) {
    users.belongsTo(models.roles, {
      foreignKey: "role_id"
    });
    users.belongsTo(users,{
      foreignKey: "createdBy",
      as: "creator"
    });
  };
  return users;
};