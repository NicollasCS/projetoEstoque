const User = require('../models/user');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = {
    async create(req, res) {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Email inválido' });
            }

            if (senha.length < 6) {
                return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
            }

            const existingUser = await User.findOne({
                where: { email: email.trim().toLowerCase() }
            });

            if (existingUser) {
                return res.status(409).json({ message: 'Email já cadastrado' });
            }

            const user = await User.create({
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                senha
            });

            return res.status(201).json({
                message: 'Usuário criado com sucesso',
                usuario: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: { exclude: ['senha'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async findByEmail(req, res) {
        try {
            const { email } = req.params;
            const user = await User.findOne({
                where: { email: email.trim().toLowerCase() },
                attributes: { exclude: ['senha'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async list(req, res) {
        try {
            const { page = 1, limit = 10, nome = '' } = req.query;
            const offset = (page - 1) * limit;
            const where = {};

            if (nome) {
                where.nome = { [Op.iLike]: `%${nome}%` };
            }

            const { count, rows } = await User.findAndCountAll({
                where,
                attributes: { exclude: ['senha'] },
                order: [['nome', 'ASC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10)
            });

            return res.status(200).json({
                usuarios: rows,
                total: count,
                pagina: parseInt(page, 10),
                totalPaginas: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, senha } = req.body;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (email && email.trim().toLowerCase() !== user.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ message: 'Email inválido' });
                }

                const existingUser = await User.findOne({
                    where: { email: email.trim().toLowerCase() }
                });

                if (existingUser) {
                    return res.status(409).json({ message: 'Email já cadastrado por outro usuário' });
                }
            }

            if (senha && senha.length < 6) {
                return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
            }

            const updateData = {
                nome: nome ? nome.trim() : user.nome,
                email: email ? email.trim().toLowerCase() : user.email
            };

            if (senha) {
                updateData.senha = senha;
            }

            await user.update(updateData);

            const updatedUser = await User.findByPk(id, {
                attributes: { exclude: ['senha'] }
            });

            return res.status(200).json({ message: 'Usuário atualizado com sucesso', usuario: updatedUser });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (req.userId && parseInt(id, 10) === req.userId) {
                return res.status(403).json({ message: 'Você não pode excluir sua própria conta' });
            }

            await user.destroy();

            return res.status(200).json({ message: 'Usuário excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { senhaAtual, novaSenha } = req.body;

            if (!senhaAtual || !novaSenha) {
                return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
            }

            if (novaSenha.length < 6) {
                return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres' });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

            if (!senhaValida) {
                return res.status(401).json({ message: 'Senha atual incorreta' });
            }

            await user.update({ senha: novaSenha });

            return res.status(200).json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.userId, {
                attributes: { exclude: ['senha'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    async updateProfile(req, res) {
        try {
            const { nome, email } = req.body;
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (email && email.trim().toLowerCase() !== user.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ message: 'Email inválido' });
                }

                const existingUser = await User.findOne({
                    where: { email: email.trim().toLowerCase() }
                });

                if (existingUser) {
                    return res.status(409).json({ message: 'Email já cadastrado por outro usuário' });
                }
            }

            await user.update({
                nome: nome ? nome.trim() : user.nome,
                email: email ? email.trim().toLowerCase() : user.email
            });

            const updatedUser = await User.findByPk(req.userId, {
                attributes: { exclude: ['senha'] }
            });

            return res.status(200).json({ message: 'Perfil atualizado com sucesso', usuario: updatedUser });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};
