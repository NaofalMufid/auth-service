'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("users", "role_id", {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:2,
          references: {
            model: "roles",
            key: "id",
          },
        }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([queryInterface.removeColumn("users", "role_id")]);
    });
  }
};
