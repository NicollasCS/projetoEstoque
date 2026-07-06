const database = require('../config/database')
const { DataTypes } = require("sequelize");

const Movimentacao = database.define("movimentacao", {
  id: {
    type: DataTypes.SERIAL,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_entrada: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_saida: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  produto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'produtos',
        key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'users',
        key: 'id'
    }
  }
});

Movimentacao.sync({alter: true})

module.exports = Movimentacao;