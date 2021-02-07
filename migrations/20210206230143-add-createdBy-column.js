'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("users", "createdBy", {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
        }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([queryInterface.removeColumn("users", "createdBy")]);
    });
  }
};
