/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('common_mobile', {
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tenantid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    rainfallamount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    flooddepth: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dislikes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'common_mobile',
    schema: 'public',
    hasTrigger: true
  });
};
