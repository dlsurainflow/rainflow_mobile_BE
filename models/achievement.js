module.exports = (sequelize, Sequelize) => {
  const mobile_achievements = sequelize.define("mobile_achievements", {
    // title: {
    //   Type: Sequelize.STRING(50),
    // },
    // description: {
    //   type: Sequelize.STRING(50),
    // },
    criteria: {
      type: Sequelize.JSONB,
    },
    points: {
      type: Sequelize.INTEGER,
    },
  });

  return mobile_achievements;
};
