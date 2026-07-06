const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

module.exports = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' });
            }

            const user = await User.findOne({
                where: { email: email.trim().toLowerCase() }
            });

            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            const senhaValida = await bcrypt.compare(senha, user.senha);

            if (!senhaValida) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, nome: user.nome },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};
