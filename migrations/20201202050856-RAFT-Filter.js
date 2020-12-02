"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("RAFTs", "certainty", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("RAFTs", "certainty")]);
  },
};
