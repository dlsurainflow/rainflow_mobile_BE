"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("RAFTs", "position", {
        type: Sequelize.GEOMETRY("POINT", 4326),
        allowNull: true,
      }),
      queryInterface.addColumn("Reports", "position", {
        type: Sequelize.GEOMETRY("POINT", 4326),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [queryInterface.removeColumn("RAFTs", "position")],
      [queryInterface.removeColumn("Reports", "position")]
    );
  },
};
