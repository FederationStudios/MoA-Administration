const { DataTypes } = require("sequelize");

module.exports.import = (sequelize) => sequelize.define("Model", {
  columnA: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  columnB: {
    type: DataTypes.STRING,
    allowNull: false
  }
});