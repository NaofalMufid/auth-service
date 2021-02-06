'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   return await queryInterface.bulkInsert('roles',[
     {
       "name": "admin",
        createdAt : new Date(),
        updatedAt : new Date()
     },
     {
       "name": "nonadmin",
       createdAt : new Date(),
       updatedAt : new Date()
     }
   ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('roles', null, {});
  }
};
