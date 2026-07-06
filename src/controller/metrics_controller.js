const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const Movimentacao = require('../models/movimentacao');
const { Op, Sequelize } = require('sequelize');

module.exports = {
    async getMetrics(req, res) {
        try {
            const totalProducts = await Produto.count();

            const criticalStock = await Produto.count({
                where: {
                    quantidade: { [Op.lte]: Sequelize.col('estoque_minimo') }
                }
            });

            const lowStock = await Produto.count({
                where: {
                    [Op.and]: [
                        { quantidade: { [Op.gt]: Sequelize.col('estoque_minimo') } },
                        { quantidade: { [Op.lte]: Sequelize.literal('estoque_minimo * 2') } }
                    ]
                }
            });

            const normalStock = await Produto.count({
                where: {
                    quantidade: { [Op.gt]: Sequelize.literal('estoque_minimo * 2') }
                }
            });

            const totalValueResult = await Produto.findOne({
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.literal('preco * quantidade')), 'totalValue']
                ],
                raw: true
            });
            const totalValue = parseFloat(totalValueResult?.totalValue || 0);

            const produtosPorCategoriaRaw = await Produto.findAll({
                attributes: [
                    'categoria_id',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'product_count'],
                    [Sequelize.fn('SUM', Sequelize.literal('preco * quantidade')), 'category_value']
                ],
                group: ['categoria_id'],
                raw: true
            });

            const categoriaIds = produtosPorCategoriaRaw.map(item => item.categoria_id).filter(Boolean);
            const categorias = await Categoria.findAll({ where: { id: categoriaIds } });
            const mapaCategorias = Object.fromEntries(categorias.map(categoria => [categoria.id, categoria.nome]));

            const topProducts = await Produto.findAll({
                attributes: [
                    'id',
                    'nome',
                    'preco',
                    'quantidade',
                    [Sequelize.literal('preco * quantidade'), 'total_value']
                ],
                order: [[Sequelize.literal('preco * quantidade'), 'DESC']],
                limit: 5,
                raw: true
            });

            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const recentMovements = await Movimentacao.count({
                where: {
                    createdAt: { [Op.gte]: lastWeek }
                }
            });

            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const monthEntrada = parseInt((await Movimentacao.sum('quantidade', {
                where: {
                    tipo_entrada: 'entrada',
                    createdAt: { [Op.gte]: currentMonth }
                }
            })) || 0, 10);

            const monthSaida = parseInt((await Movimentacao.sum('quantidade', {
                where: {
                    tipo_saida: 'saida',
                    createdAt: { [Op.gte]: currentMonth }
                }
            })) || 0, 10);

            const lastMovementsRaw = await Movimentacao.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                raw: true
            });

            const produtoIds = [...new Set(lastMovementsRaw.map(item => item.produto_id).filter(Boolean))];
            const produtos = await Produto.findAll({ where: { id: produtoIds } });
            const mapaProdutos = Object.fromEntries(produtos.map(produto => [produto.id, produto.nome]));

            return res.status(200).json({
                resumo: {
                    total_produtos: totalProducts,
                    estoque_critico: criticalStock,
                    estoque_baixo: lowStock,
                    estoque_normal: normalStock,
                    valor_total: totalValue.toFixed(2),
                    movimentacoes_recentes: recentMovements
                },
                movimentacoes_do_mes: {
                    entrada: monthEntrada,
                    saida: monthSaida,
                    total: monthEntrada + monthSaida
                },
                produtos_por_categoria: produtosPorCategoriaRaw.map(item => ({
                    categoria: mapaCategorias[item.categoria_id] || 'Sem categoria',
                    count: parseInt(item.product_count, 10),
                    value: parseFloat(item.category_value || 0).toFixed(2)
                })),
                top_produtos: topProducts.map(p => ({
                    id: p.id,
                    nome: p.nome,
                    preco: parseFloat(p.preco).toFixed(2),
                    quantidade: parseInt(p.quantidade, 10),
                    valor_total: parseFloat(p.total_value).toFixed(2)
                })),
                ultimas_movimentacoes: lastMovementsRaw.map(m => ({
                    id: m.id,
                    produto: mapaProdutos[m.produto_id] || 'Produto não encontrado',
                    tipo: m.tipo_entrada ? 'entrada' : 'saida',
                    quantidade: m.quantidade,
                    createdAt: m.createdAt
                }))
            });
        } catch (error) {
            console.error('Erro ao buscar métricas:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async getSimpleMetrics(req, res) {
        try {
            const totalProducts = await Produto.count();
            const criticalStock = await Produto.count({
                where: {
                    quantidade: { [Op.lte]: Sequelize.col('estoque_minimo') }
                }
            });
            const totalValueResult = await Produto.findOne({
                attributes: [[Sequelize.fn('SUM', Sequelize.literal('preco * quantidade')), 'totalValue']],
                raw: true
            });
            const totalValue = parseFloat(totalValueResult?.totalValue || 0);
            const recentMovements = await Movimentacao.count({
                where: {
                    createdAt: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            });
            return res.status(200).json({
                total_produtos: totalProducts,
                estoque_critico: criticalStock,
                valor_total: totalValue.toFixed(2),
                movimentacoes_recentes: recentMovements
            });
        } catch (error) {
            console.error('Erro ao buscar métricas simplificadas:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};