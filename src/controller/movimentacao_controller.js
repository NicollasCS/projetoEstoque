const Produto = require('../models/produto');
const Movimentacao = require('../models/movimentacao');
const Log = require('../models/log');
const { Op, Sequelize } = require('sequelize');
const database = require('../config/database');

module.exports = {
    async registerMovement(req, res) {
        const transaction = await database.transaction();

        try {
            const produtoId = req.body.produto_id || req.body.productId;
            const tipo = req.body.tipo || req.body.type;
            const quantidade = req.body.quantidade || req.body.quantity;
            const usuarioId = req.userId;

            if (!produtoId || !tipo || quantidade === undefined) {
                return res.status(400).json({ message: 'Produto, tipo e quantidade são obrigatórios' });
            }

            if (!['entrada', 'saida'].includes(tipo)) {
                return res.status(400).json({ message: 'Tipo deve ser "entrada" ou "saida"' });
            }

            const qty = parseInt(quantidade, 10);
            if (qty <= 0) {
                return res.status(400).json({ message: 'Quantidade deve ser maior que zero' });
            }

            const product = await Produto.findByPk(produtoId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const quantidadeAntiga = product.quantidade;
            let quantidadeAtual = quantidadeAntiga;

            if (tipo === 'entrada') {
                quantidadeAtual += qty;
            } else {
                if (quantidadeAntiga < qty) {
                    await transaction.rollback();
                    return res.status(400).json({ message: `Estoque insuficiente. Disponível: ${quantidadeAntiga}` });
                }
                quantidadeAtual -= qty;
            }

            await product.update({ quantidade: quantidadeAtual }, { transaction });

            const movement = await Movimentacao.create({
                tipo_entrada: tipo === 'entrada' ? 'entrada' : '',
                tipo_saida: tipo === 'saida' ? 'saida' : '',
                quantidade: qty,
                produto_id: produtoId,
                usuario_id: usuarioId
            }, { transaction });

            await Log.create({
                action: 'STOCK_MOVEMENT',
                entity: 'Movimentacao',
                entity_id: movement.id,
                user_id: usuarioId,
                data_criacao: new Date()
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({
                message: 'Movimentação registrada com sucesso',
                movimentacao: {
                    id: movement.id,
                    tipo,
                    quantidade: movement.quantidade,
                    createdAt: movement.createdAt
                },
                produto: {
                    id: product.id,
                    nome: product.nome,
                    quantidade_anterior: quantidadeAntiga,
                    quantidade_atual: quantidadeAtual
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Erro ao registrar movimentação:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async listMovements(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                productId = null,
                type = null,
                startDate = null,
                endDate = null
            } = req.query;
            const offset = (page - 1) * limit;
            const where = {};

            if (productId) where.produto_id = productId;
            if (type === 'entrada') where.tipo_entrada = 'entrada';
            if (type === 'saida') where.tipo_saida = 'saida';

            if (startDate && endDate) {
                where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
            }

            const { count, rows } = await Movimentacao.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                raw: true
            });

            const movimentos = await incluirNomesProdutos(rows);

            return res.status(200).json({
                movimentacoes: movimentos,
                total: count,
                pagina: parseInt(page, 10),
                totalPaginas: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao listar movimentações:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const movement = await Movimentacao.findByPk(id, { raw: true });

            if (!movement) {
                return res.status(404).json({ message: 'Movimentação não encontrada' });
            }

            const [resultado] = await incluirNomesProdutos([movement]);
            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao buscar movimentação:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async listByProduct(req, res) {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            const product = await Produto.findByPk(productId);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const { count, rows } = await Movimentacao.findAndCountAll({
                where: { produto_id: productId },
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                raw: true
            });

            const movimentacoes = rows.map(item => ({
                ...item,
                tipo: item.tipo_entrada ? 'entrada' : 'saida'
            }));

            return res.status(200).json({
                produto: {
                    id: product.id,
                    nome: product.nome,
                    quantidade_atual: product.quantidade
                },
                movimentacoes,
                total: count,
                pagina: parseInt(page, 10),
                totalPaginas: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao listar movimentações do produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};

async function incluirNomesProdutos(movements) {
    const produtoIds = [...new Set(movements.map(item => item.produto_id).filter(Boolean))];
    const produtos = await Produto.findAll({ where: { id: produtoIds } });
    const mapaProdutos = Object.fromEntries(produtos.map(produto => [produto.id, produto.nome]));

    return movements.map(item => ({
        ...item,
        tipo: item.tipo_entrada ? 'entrada' : 'saida',
        produto: mapaProdutos[item.produto_id] || null
    }));
}
