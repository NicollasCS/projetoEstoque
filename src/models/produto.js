const database = require('../config/database')
const { DataTypes } = require("sequelize");

const Produto = database.define("produto", {
  id: {
    type: DataTypes.SERIAL,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estoque_minimo: {
    type: DataTypes.INTEGER,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'categorias',
        key: 'id'
    }
  },
});

Produto.sync({alter: true})

module.exports = Produto;