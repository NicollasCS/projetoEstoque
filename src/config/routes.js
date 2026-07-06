const AuthController = require('../controller/auth_controller');
const ProductController = require('../controller/produtos_controller');
const CategoryController = require('../controller/categoria_controller');
const StockController = require('../controller/movimentacao_controller');
const LogController = require('../controller/logs_controller');
const MetricsController = require('../controller/metrics_controller');

function routes(app) {
    app.post('/auth/login', AuthController.login);

    app.get('/products', ProductController.list);
    app.post('/product', ProductController.create);
    app.put('/product/:id', ProductController.update);

    app.post('/category', CategoryController.create);
    app.get('/categories', CategoryController.list);

    app.post('/stock/movement', StockController.registerMovement);

    app.get('/logs', LogController.list);

    app.get('/metrics', MetricsController.getMetrics);
}

module.exports = routes;