const database = require('../config/database')
const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');

const User = database.define("user", {
  id: {
    type: DataTypes.SERIAL,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false, 
    set(value) {
      const hashedPassword = bcrypt.hashSync(value, 10);
      this.setDataValue('senha', hashedPassword);
    }  
  },
});

User.sync({alter: true})

module.exports = User;