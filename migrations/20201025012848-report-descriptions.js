"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Reports", "description", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("ReportHistories", "description", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Reports", "description"),
      queryInterface.removeColumn("ReportHistories", "description"),
    ]);
  },
};
