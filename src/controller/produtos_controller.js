const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const Log = require('../models/log');
const { Op, Sequelize } = require('sequelize');

module.exports = {
    async list(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                nome = '',
                categoriaId = null,
                status = null,
                minPrice = null,
                maxPrice = null
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            if (nome) {
                where.nome = { [Op.iLike]: `%${nome}%` };
            }

            if (categoriaId) {
                where.categoria_id = categoriaId;
            }

            if (minPrice && maxPrice) {
                where.preco = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
            } else if (minPrice) {
                where.preco = { [Op.gte]: parseFloat(minPrice) };
            } else if (maxPrice) {
                where.preco = { [Op.lte]: parseFloat(maxPrice) };
            }

            if (status === 'critical') {
                where.quantidade = { [Op.lte]: Sequelize.col('estoque_minimo') };
            } else if (status === 'low') {
                where.quantidade = {
                    [Op.gt]: Sequelize.col('estoque_minimo'),
                    [Op.lte]: Sequelize.literal('estoque_minimo * 2')
                };
            } else if (status === 'normal') {
                where.quantidade = { [Op.gt]: Sequelize.literal('estoque_minimo * 2') };
            }

            const { count, rows } = await Produto.findAndCountAll({
                where,
                order: [['nome', 'ASC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10)
            });

            const produtos = await carregarCategorias(rows);

            return res.status(200).json({
                produtos,
                total: count,
                pagina: parseInt(page, 10),
                totalPaginas: Math.ceil(count / limit),
                limite: parseInt(limit, 10)
            });
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async findById(req, res) {
        try {
            const { id } = req.params;
            const product = await Produto.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            const categoria = await Categoria.findByPk(product.categoria_id, {
                attributes: ['id', 'nome']
            });

            return res.status(200).json({
                ...product.get({ plain: true }),
                categoria: categoria ? categoria.get({ plain: true }) : null
            });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async create(req, res) {
        try {
            const { nome, descricao, preco, quantidade, estoque_minimo, categoria_id } = req.body;

            if (!nome || preco === undefined || quantidade === undefined || !categoria_id) {
                return res.status(400).json({ message: 'Nome, preço, quantidade e categoria são obrigatórios' });
            }

            const categoria = await Categoria.findByPk(categoria_id);
            if (!categoria) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            const existingProduct = await Produto.findOne({
                where: { nome: nome.trim() }
            });

            if (existingProduct) {
                return res.status(409).json({ message: 'Já existe um produto com este nome' });
            }

            const product = await Produto.create({
                nome: nome.trim(),
                descricao: descricao || '',
                preco: parseFloat(preco),
                quantidade: parseInt(quantidade, 10),
                estoque_minimo: estoque_minimo ? parseInt(estoque_minimo, 10) : 0,
                categoria_id: parseInt(categoria_id, 10)
            });

            await Log.create({
                action: 'CREATE',
                entity: 'Produto',
                entity_id: product.id,
                user_id: req.userId,
                data_criacao: new Date()
            });

            return res.status(201).json({ message: 'Produto criado com sucesso', produto: product });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, preco, quantidade, estoque_minimo, categoria_id } = req.body;
            const product = await Produto.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            if (categoria_id) {
                const categoria = await Categoria.findByPk(categoria_id);
                if (!categoria) {
                    return res.status(404).json({ message: 'Categoria não encontrada' });
                }
            }

            if (nome && nome.trim() !== product.nome) {
                const existingProduct = await Produto.findOne({
                    where: { nome: nome.trim() }
                });
                if (existingProduct) {
                    return res.status(409).json({ message: 'Já existe um produto com este nome' });
                }
            }

            await product.update({
                nome: nome ? nome.trim() : product.nome,
                descricao: descricao !== undefined ? descricao : product.descricao,
                preco: preco !== undefined ? parseFloat(preco) : product.preco,
                quantidade: quantidade !== undefined ? parseInt(quantidade, 10) : product.quantidade,
                estoque_minimo: estoque_minimo !== undefined ? parseInt(estoque_minimo, 10) : product.estoque_minimo,
                categoria_id: categoria_id ? parseInt(categoria_id, 10) : product.categoria_id
            });

            await Log.create({
                action: 'UPDATE',
                entity: 'Produto',
                entity_id: product.id,
                user_id: req.userId,
                data_criacao: new Date()
            });

            return res.status(200).json({ message: 'Produto atualizado com sucesso', produto: product });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const product = await Produto.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            await product.destroy();

            await Log.create({
                action: 'DELETE',
                entity: 'Produto',
                entity_id: parseInt(id, 10),
                user_id: req.userId,
                data_criacao: new Date()
            });

            return res.status(200).json({ message: 'Produto excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async search(req, res) {
        try {
            const { q, categoriaId, status, sort } = req.query;
            const where = {};

            if (q) {
                where[Op.or] = [
                    { nome: { [Op.iLike]: `%${q}%` } },
                    { descricao: { [Op.iLike]: `%${q}%` } }
                ];
            }

            if (categoriaId) {
                where.categoria_id = categoriaId;
            }

            if (status === 'critical') {
                where.quantidade = { [Op.lte]: Sequelize.col('estoque_minimo') };
            }

            let order = [['nome', 'ASC']];
            if (sort === 'price_asc') order = [['preco', 'ASC']];
            if (sort === 'price_desc') order = [['preco', 'DESC']];

            const rows = await Produto.findAll({
                where,
                order,
                limit: 20
            });

            const produtos = await carregarCategorias(rows);

            return res.status(200).json(produtos);
        } catch (error) {
            console.error('Erro na busca de produtos:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};

async function carregarCategorias(produtos) {
    const items = produtos.map(produto => produto.get ? produto.get({ plain: true }) : produto);
    const categoriaIds = [...new Set(items.map(item => item.categoria_id).filter(Boolean))];

    if (!categoriaIds.length) {
        return items.map(item => ({ ...item, categoria: null }));
    }

    const categorias = await Categoria.findAll({
        where: { id: categoriaIds }
    });

    const mapaCategorias = Object.fromEntries(categorias.map(categoria => [categoria.id, {
        id: categoria.id,
        nome: categoria.nome
    }]));

    return items.map(item => ({
        ...item,
        categoria: mapaCategorias[item.categoria_id] || null
    }));
}
