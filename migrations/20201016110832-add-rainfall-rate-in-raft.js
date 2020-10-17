"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("RAFTs", "rainfall_rate", {
        type: Sequelize.FLOAT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promose.all([queryInterface.removeColumn("RAFTs", "rainfall_rate")]);
  },
};
