const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa o modelo de usuário
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken
require('dotenv').config(); // Carrega as variáveis de ambiente

// Função auxiliar para gerar JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expira em 1 hora
    });
};

// @route POST /api/auth/register
// @desc Registrar um novo usuário
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // 1. Verificar se o usuário já existe
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'Usuário ou e-mail já registrado.' });
        }

        // 2. Criar novo usuário (o middleware .pre('save') cuidará do hash da senha)
        const user = await User.create({
            username,
            email,
            password,
            // A role só deve ser 'admin' se for explicitamente definido e permitido
            // Para simplicidade inicial, vamos permitir que o frontend envie, mas em um app real, admins seriam criados por outro admin
            role: role === 'admin' ? 'admin' : 'user' // Garante que a role padrão seja 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Gera e retorna o token
                message: 'Usuário registrado com sucesso!'
            });
        } else {
            res.status(400).json({ message: 'Dados de usuário inválidos.' });
        }

    } catch (error) {
        console.error('Erro no registro:', error);
        // Tratamento de erro para validações do Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Erro no servidor durante o registro.' });
    }
});

// @route POST /api/auth/login
// @desc Autenticar usuário e obter token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar se o usuário existe pelo email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) { // Compara a senha
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Retorna o token
                message: 'Login realizado com sucesso!'
            });
        } else {
            res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor durante o login.' });
    }
});

module.exports = router;