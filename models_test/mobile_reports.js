/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mobile_reports', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    rainfall_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    flood_depth: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    upvote: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    downvote: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'mobile_reports',
    schema: 'public'
  });
};
