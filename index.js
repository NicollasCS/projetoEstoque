require('dotenv').config();

const express = require('express');
const routes = require('./src/config/routes');
const database = require('./src/config/database');

const app = express();
app.use(express.json());

routes(app);

async function startServer() {
  try {
    await database.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    await database.sync();
    console.log('Banco de dados sincronizado.');

    app.listen(3000, () => {
      console.log('Server is running on http://127.0.0.1:3000');
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();