const Categoria = require('../models/categoria');
const Produto = require('../models/produto');
const { Op } = require('sequelize');

module.exports = {
    async create(req, res) {
        try {
            const { nome, descricao } = req.body;

            if (!nome) {
                return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
            }

            const existingCategory = await Categoria.findOne({
                where: { nome: nome.trim() }
            });

            if (existingCategory) {
                return res.status(409).json({ message: 'Categoria já existe' });
            }

            const category = await Categoria.create({
                nome: nome.trim(),
                descricao: descricao || ''
            });

            return res.status(201).json({ message: 'Categoria criada com sucesso', categoria: category });
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async list(req, res) {
        try {
            const { nome, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            const where = {};

            if (nome) {
                where.nome = { [Op.iLike]: `%${nome}%` };
            }

            const { count, rows } = await Categoria.findAndCountAll({
                where,
                order: [['nome', 'ASC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10)
            });

            return res.status(200).json({
                categorias: rows,
                total: count,
                pagina: parseInt(page, 10),
                totalPaginas: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async findById(req, res) {
        try {
            const { id } = req.params;
            const category = await Categoria.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            const produtos = await Produto.findAll({
                where: { categoria_id: id },
                attributes: ['id', 'nome', 'preco', 'quantidade']
            });

            return res.status(200).json({ categoria: category, produtos });
        } catch (error) {
            console.error('Erro ao buscar categoria:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;
            const category = await Categoria.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            if (nome && nome.trim() !== category.nome) {
                const existingCategory = await Categoria.findOne({
                    where: { nome: nome.trim() }
                });
                if (existingCategory) {
                    return res.status(409).json({ message: 'Já existe uma categoria com este nome' });
                }
            }

            await category.update({
                nome: nome ? nome.trim() : category.nome,
                descricao: descricao !== undefined ? descricao : category.descricao
            });

            return res.status(200).json({ message: 'Categoria atualizada com sucesso', categoria: category });
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Categoria.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            const productCount = await Produto.count({
                where: { categoria_id: id }
            });

            if (productCount > 0) {
                return res.status(400).json({
                    message: `Não é possível excluir esta categoria pois existem ${productCount} produtos associados a ela`
                });
            }

            await category.destroy();
            return res.status(200).json({ message: 'Categoria excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};