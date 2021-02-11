'use strict';
const bcrypt = require("bcryptjs");
module.exports = {
  up: async (queryInterface, Sequelize) => {
   return await queryInterface.bulkInsert('users',[
     {
       username: "adminku",
       email: "adminku@gmail.com",
       password: bcrypt.hashSync("adminku", 10),
       role_id: "1",
        createdAt : new Date(),
        updatedAt : new Date()
     },
     {
      username: "usernyan",
      email: "usernyan@gmail.com",
      password: bcrypt.hashSync("nyanyan", 10),
      role_id: "2",
       createdAt : new Date(),
       updatedAt : new Date()
     }
   ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('roles', null, {});
  }
};
