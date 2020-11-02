"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("RAFTs", "water_level", {
        type: Sequelize.FLOAT,
        allowNull: true,
      }),
      queryInterface.addColumn("RAFTs", "address", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Reports", "address", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("ReportHistories", "address", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("RAFTs", "water_level"),
      queryInterface.removeColumn("RAFTs", "address"),
      queryInterface.removeColumn("Reports", "address"),
      queryInterface.removeColumn("ReportHistories", "address"),
    ]);
  },
};
