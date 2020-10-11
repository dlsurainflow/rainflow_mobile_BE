"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Reports", "image", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("ReportHistories", "image", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promose.all([
      queryInterface.removeColumn("Reports", "image"),
      queryInterface.removeColumn("ReportHistories", "image"),
    ]);
  },
};
