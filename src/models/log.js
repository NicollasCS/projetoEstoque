const database = require('../config/database')
const { DataTypes } = require("sequelize");

const Log = database.define("log", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'users',
        key: 'id'
    }
  },
  data_criacao: {
    type: DataTypes.TIMESTAMP,
    allowNull: false,
  }
});

Log.sync({alter: true})

module.exports = Log;