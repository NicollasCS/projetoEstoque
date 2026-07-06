require('dotenv').config();

const express = require('express');
const routes = require('./src/config/routes');
const database = require('./src/config/database');

database.authenticate();

const app = express();
app.use(express.json());

routes(app);

database.sync();

app.listen(3000, () => {
  console.log('Server is running on http://127.0.0.1:3000');
});