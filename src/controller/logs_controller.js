const { Log, User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
    async list(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                entity = null,
                action = null,
                startDate = null,
                endDate = null
            } = req.query;
            const offset = (page - 1) * limit;
            const where = {};
            if (entity) {
                where.entity = entity;
            }
            if (action) {
                where.action = action;
            }
            if (startDate && endDate) {
                where.data_criacao = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }
            const { count, rows } = await Log.findAndCountAll({
                where,
                order: [['data_criacao', 'DESC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                raw: true
            });
            const formattedLogs = await Promise.all(rows.map(async log => {
                const user = await User.findByPk(log.user_id, {
                    attributes: ['id', 'nome', 'email'],
                    raw: true
                });
                return {
                    id: log.id,
                    action: log.action,
                    entity: log.entity,
                    entity_id: log.entity_id,
                    user: user ? user.nome : 'Usuário desconhecido',
                    user_email: user ? user.email : 'desconhecido',
                    created_at: log.data_criacao,
                    message: getActionMessage(log.action, log.entity, log.entity_id)
                };
            }));
            return res.status(200).json({
                logs: formattedLogs,
                total: count,
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao listar logs:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    async findByEntity(req, res) {
        try {
            const { entity, id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            const { count, rows } = await Log.findAndCountAll({
                where: {
                    entity,
                    entity_id: parseInt(id, 10)
                },
                order: [['data_criacao', 'DESC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                raw: true
            });
            const formattedLogs = await Promise.all(rows.map(async log => {
                const user = await User.findByPk(log.user_id, {
                    attributes: ['id', 'nome', 'email'],
                    raw: true
                });
                return {
                    id: log.id,
                    action: log.action,
                    entity: log.entity,
                    entity_id: log.entity_id,
                    user: user ? user.nome : 'Usuário desconhecido',
                    user_email: user ? user.email : 'desconhecido',
                    created_at: log.data_criacao,
                    message: getActionMessage(log.action, log.entity, log.entity_id)
                };
            }));
            return res.status(200).json({
                logs: formattedLogs,
                total: count,
                page: parseInt(page, 10),
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            console.error('Erro ao buscar logs por entidade:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};

function getActionMessage(action, entity, entityId) {
    const messages = {
        CREATE: `Criou novo ${entity.toLowerCase()} (ID: ${entityId})`,
        UPDATE: `Editou ${entity.toLowerCase()} (ID: ${entityId})`,
        DELETE: `Excluiu ${entity.toLowerCase()} (ID: ${entityId})`,
        STOCK_MOVEMENT: `Registrou movimentação de estoque (${entity.toLowerCase()} ID: ${entityId})`
    };
    return messages[action] || `${action} - ${entity} (ID: ${entityId})`;
}
