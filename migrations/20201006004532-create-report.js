"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Reports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      latitude: {
        type: Sequelize.DOUBLE,
      },
      longitude: {
        type: Sequelize.DOUBLE,
      },
      rainfall_rate: {
        type: Sequelize.DOUBLE,
      },
      flood_depth: {
        type: Sequelize.DOUBLE,
      },
      userID: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "User",
          key: "id",
          as: "userID",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Reports");
  },
};
