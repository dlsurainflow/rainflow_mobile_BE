/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mobile_user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleIntID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tenantID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now')
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'mobile_user',
    schema: 'public'
  });
};
