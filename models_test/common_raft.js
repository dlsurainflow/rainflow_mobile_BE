/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('common_raft', {
    time: {
      type: DataTypes.DATE,
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
    altitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    flooddepth: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    rainfallrate: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    rainfallamount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    temperature: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    pressure: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    humidity: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    polyid: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'common_raft',
    schema: 'public'
  });
};
