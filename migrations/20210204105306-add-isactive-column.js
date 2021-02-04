'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("users", "is_active", {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([queryInterface.removeColumn("users", "is_active")]);
    });
  }
};
