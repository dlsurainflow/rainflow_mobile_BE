/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mobile_report_history', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    rainfall_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    flood_depth: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    upvote: {
      type: DataTypes.JSON,
      allowNull: true
    },
    downvote: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mobile_report_history',
    schema: 'public'
  });
};
