const { Sequelize } = require('sequelize');

const {
  PSQL_USER = 'postgres',
  PSQL_PASS = 'postgres',
  PSQL_HOST = '127.0.0.1',
  PSQL_PORT = 5432,
  PSQL_DATABASE = 'projeto_estoque'
} = process.env;


const connectionString = `postgres://${PSQL_USER}:${PSQL_PASS}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}`;

const database = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false
});

module.exports = database;