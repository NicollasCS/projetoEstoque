const AuthController = require('../controller/auth_controller');
const UserController = require('../controller/user_controller');
const CategoriaController = require('../controller/categoria_controller');
const ProdutosController = require('../controller/produtos_controller');
const MovimentacaoController = require('../controller/movimentacao_controller');
const LogsController = require('../controller/logs_controller');
const MetricsController = require('../controller/metrics_controller');

function routes(app) {
    app.post('/auth/login', AuthController.login);
    app.post('/usuarios', UserController.create);
    app.get('/usuarios/:id', UserController.findById);
    app.get('/usuarios/email/:email', UserController.findByEmail);
    app.get('/usuarios', UserController.list);
    app.put('/usuarios/:id', UserController.update);
    app.delete('/usuarios/:id', UserController.delete);
    app.put('/usuarios/:id/senha', UserController.changePassword);
    app.get('/perfil', UserController.getProfile);
    app.put('/perfil', UserController.updateProfile);
    app.post('/produtos', ProdutosController.create);
    app.get('/produtos', ProdutosController.list);
    app.get('/produtos/busca', ProdutosController.search);
    app.get('/produtos/:id', ProdutosController.findById);
    app.put('/produtos/:id', ProdutosController.update);
    app.delete('/produtos/:id', ProdutosController.delete);
    app.post('/categorias', CategoriaController.create);
    app.get('/categorias', CategoriaController.list);
    app.get('/categorias/:id', CategoriaController.findById);
    app.put('/categorias/:id', CategoriaController.update);
    app.delete('/categorias/:id', CategoriaController.delete);
    app.post('/estoque/movimentacoes', MovimentacaoController.registerMovement);
    app.get('/estoque/movimentacoes', MovimentacaoController.listMovements);
    app.get('/estoque/movimentacoes/:id', MovimentacaoController.findById);
    app.get('/estoque/movimentacoes/produto/:productId', MovimentacaoController.listByProduct);
    app.get('/logs', LogsController.list);
    app.get('/logs/entidade/:entity/:id', LogsController.findByEntity);
    app.get('/metricas', MetricsController.getMetrics);
    app.get('/metricas/simples', MetricsController.getSimpleMetrics);
}

module.exports = routes;