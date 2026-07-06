const UserController = require('../controllers/user_controller');

function routes(app) {
  app.post('/auth/login',);
  app.post('/produto',);
  app.post('/categoria',);
  app.post('/estoque/movimentacao',);

  app.get('/produtos', );
  app.get('/categorias',);
  app.get('/logs',);
  app.get('/metricas',);

  app.put('/produto/:id',);
  
}

module.exports = routes;