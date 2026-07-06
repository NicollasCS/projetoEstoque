const database = require('../config/database');
const User = require('./user');
const Produto = require('./produto');
const Categoria = require('./categoria');
const Movimentacao = require('./movimentacao');
const Log = require('./log');

Categoria.hasMany(Produto, { foreignKey: 'categoria_id' });
Produto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

Produto.hasMany(Movimentacao, { foreignKey: 'produto_id' });
Movimentacao.belongsTo(Produto, { foreignKey: 'produto_id' });

User.hasMany(Movimentacao, { foreignKey: 'usuario_id' });
Movimentacao.belongsTo(User, { foreignKey: 'usuario_id' });

User.hasMany(Log, { foreignKey: 'user_id' });
Log.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  database,
  User,
  Produto,
  Categoria,
  Movimentacao,
  Log
};
