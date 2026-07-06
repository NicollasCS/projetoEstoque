const database = require('../config/database')
const { DataTypes } = require("sequelize");

const Categoria = database.define("categoria", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
  },
});

Categoria.sync({alter: true})

module.exports = Categoria;